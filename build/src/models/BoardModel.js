const Joi = require("joi");
const {
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE
} = require("@/utils/validators");
const {
  GET_DB
} = require("@/configs/mongodb");
const {
  ObjectId,
  ReturnDocument
} = require("mongodb");
const {
  BOARD_TYPE
} = require("@/utils/constant");
const {
  ColumnModel
} = require("./ColumnModel");
const {
  CardModel
} = require("./CardModel");
const ApiError = require("@/utils/ApiError");
const {
  pagingSkipValue
} = require("@/utils/algorithms");
const {
  userModel
} = require("./UserModel");
const BOARD_COLLECTION_NAME = "boards";
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(255).trim().strict(),
  type: Joi.string().valid(BOARD_TYPE.PRIVATE, BOARD_TYPE.PUBLIC).required(),
  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  // Admin của board
  ownerIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  // Thành viên của board
  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createAt: Joi.date().timestamp("javascript").default(Date.now),
  updateAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false)
});
const INVALID_UPDATE_FIELD = ["_id", "createAt"];

// Chỉ định field mà không cho update khi bên validate không kiểm tra
const validateBeforeCreate = async data => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  });
};
const newBoard = async (userId, data) => {
  try {
    const validateData = await validateBeforeCreate(data);
    const newBoard = {
      ...validateData,
      ownerIds: [ObjectId.createFromHexString(userId)]
    };
    const createBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoard);
    return createBoard;
  } catch (error) {
    throw new Error(error);
  }
};
const findOneById = async id => {
  const result = await GET_DB().collection(BOARD_COLLECTION_NAME)

  // ObjectId.createFromHexString chuyển chuỗi hexa sang object id
  .findOne({
    _id: ObjectId.createFromHexString(id)
  });
  return result;
};

//  Querry tổng hợp (agreegate) để lấy toàn bộ columns và cards thuộc về board
const getDetail = async (userId, boardId) => {
  try {
    const queryConditions = [
    // Board chưa bị xóa
    {
      _id: ObjectId.createFromHexString(boardId)
    }, {
      _destroy: false
    },
    // User đang request phải thuộc 1 trong 2 cái mảng là ownerIds hoặc memberIds( sử dụng toán tử $All của mongo)
    {
      $or: [{
        ownerIds: {
          $all: [ObjectId.createFromHexString(userId)]
        }
      }, {
        memberIds: {
          $all: [ObjectId.createFromHexString(userId)]
        }
      }]
    }];
    //   // ObjectId.createFromHexString chuyển chuỗi hexa sang object id
    //   .findOne({ _id: ObjectId.createFromHexString(id) });

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([{
      $match: {
        $and: queryConditions
      }
    }, {
      $lookup: {
        from: ColumnModel.COLUMN_COLLECTION_NAME,
        localField: "_id",
        foreignField: "boardId",
        as: "columns"
      }
    }, {
      $lookup: {
        from: CardModel.CARD_COLLECTION_NAME,
        localField: "_id",
        foreignField: "boardId",
        as: "cards"
      }
    }, {
      $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: "ownerIds",
        foreignField: "_id",
        as: "owners",
        // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
        // $project để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị 0
        pipeline: [{
          $project: {
            password: 0,
            verifyToken: 0
          }
        }]
      }
    }, {
      $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: "memberIds",
        foreignField: "_id",
        as: "members",
        pipeline: [{
          $project: {
            password: 0,
            verifyToken: 0
          }
        }]
      }
    }]).toArray();
    return result[0] || null;
  } catch (error) {
    throw new Error(error);
  }
};

// push columnId vào cuối mảng orderIds của board
const pushColumnOrderIds = async column => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({
      _id: column.boardId
    }, {
      $push: {
        columnOrderIds: ObjectId.createFromHexString(column._id.toString())
      }
    }, {
      returnDocument: "after"
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const pullColumnOrderIds = async column => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({
      _id: ObjectId.createFromHexString(column.boardId.toString())
    }, {
      $pull: {
        columnOrderIds: column._id
      }
    }, {
      returnDocument: "after"
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const update = async (boardId, data) => {
  try {
    Object.keys(data).forEach(fieldName => {
      if (INVALID_UPDATE_FIELD.includes(fieldName)) {
        delete data[fieldName];
      }
    });

    // Convert sang OjectId

    // if (data.columnOrderIds) {
    //   data.columnOrderIds = data.columnOrderIds.map((_id) => {
    //     const oj = ObjectId.createFromHexString(_id);
    //     console.log("Id", oj);
    //   });
    // }
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({
      _id: ObjectId.createFromHexString(boardId)
    }, {
      $set: data
    }, {
      returnDocument: "after"
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    const queryConditions = [
    // Board chưa bị xóa
    {
      _destroy: false
    },
    // User đang request phải thuộc 1 trong 2 cái mảng là ownerIds hoặc memberIds( sử dụng toán tử $All của mongo)
    {
      $or: [{
        ownerIds: {
          $all: [ObjectId.createFromHexString(userId)]
        }
      }, {
        memberIds: {
          $all: [ObjectId.createFromHexString(userId)]
        }
      }]
    }];

    // Process query filter for each search board case
    if (queryFilters) {
      Object.keys(queryFilters).forEach(key => {
        // Case sensitive
        // queryConditions.push({
        //   [key]: { $regex: queryFilters[key] },
        // });
        // case insensitive
        queryConditions.push({
          [key]: {
            $regex: new RegExp(queryFilters[key], "i")
          }
        });
      });
    }
    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([{
      $match: {
        $and: queryConditions
      }
    },
    // sort title của board theo A_Z (mặc định sẽ bị chữ B hoa đứng trước chữ a thường (theo chuẩn bảng mã ASCII => sẽ cần fix)
    {
      $sort: {
        title: 1
      }

      // facet để xử lí nhiều luồng trong một query
    }, {
      $facet: {
        // Luồng 01: Query boards
        // queryBoards tên luồng tự đặt
        queryBoards: [{
          // Bỏ qua số lượng bảng ghi của những page trước đó
          $skip: pagingSkipValue(page, itemsPerPage)
        }, {
          // Giới hạn tối đa số lượng bảng ghi trả về trên một page
          $limit: itemsPerPage
        }],
        // Luồng 02: Query tổng số lượng boards trong DB và trả về biến
        // queryTotalBoards tên luồng tự đặt
        // countedAllBoards tên biến sau khi toán tử count trả về
        queryTotalBoards: [{
          $count: "countedAllBoards"
        }]
      }
    }], {
      // Khai báo thêm để fix vụ chữ B hoa và a thường ở trên
      collation: {
        locale: "en"
      }
    }).toArray();
    const res = query[0];
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    };
  } catch (error) {
    throw new Error(error);
  }
};
const pushMemberIds = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({
      _id: ObjectId.createFromHexString(boardId)
    }, {
      $push: {
        memberIds: ObjectId.createFromHexString(userId)
      }
    }, {
      returnDocument: "after"
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = {
  BoardModal: {
    BOARD_COLLECTION_NAME,
    BOARD_COLLECTION_SCHEMA,
    newBoard,
    findOneById,
    getDetail,
    pushColumnOrderIds,
    update,
    pullColumnOrderIds,
    getBoards,
    pushMemberIds
  }
};