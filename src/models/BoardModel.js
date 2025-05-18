const Joi = require("joi");
const {
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
} = require("@/utils/validators");
const { GET_DB } = require("@/configs/mongodb");
const { ObjectId, ReturnDocument } = require("mongodb");
const { BOARD_TYPE } = require("@/utils/constant");
const { ColumnModel } = require("./ColumnModel");
const { CardModel } = require("./CardModel");
const BOARD_COLLECTION_NAME = "boards";
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(255).trim().strict(),
  type: Joi.string().valid(BOARD_TYPE.PRIVATE, BOARD_TYPE.PUBLIC).required(),

  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  createAt: Joi.date().timestamp("javascript").default(Date.now),
  updateAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELD = ["_id", "createAt"];

// Chỉ định field mà không cho update khi bên validate không kiểm tra
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const newModal = async (data) => {
  try {
    const validateData = await validateBeforeCreate(data);
    const createBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(validateData);
    return createBoard;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  const result = await GET_DB()
    .collection(BOARD_COLLECTION_NAME)

    // ObjectId.createFromHexString chuyển chuỗi hexa sang object id
    .findOne({ _id: ObjectId.createFromHexString(id) });
  return result;
};

//  Querry tổng hợp (agreegate) để lấy toàn bộ columns và cards thuộc về board
const getDetail = async (id) => {
  try {
    //   // ObjectId.createFromHexString chuyển chuỗi hexa sang object id
    //   .findOne({ _id: ObjectId.createFromHexString(id) });

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: ObjectId.createFromHexString(id),
            _destroy: false,
          },
        },
        {
          $lookup: {
            from: ColumnModel.COLUMN_COLLECTION_NAME,
            localField: "_id",
            foreignField: "boardId",
            as: "columns",
          },
        },
        {
          $lookup: {
            from: CardModel.CARD_COLLECTION_NAME,
            localField: "_id",
            foreignField: "boardId",
            as: "cards",
          },
        },
      ])
      .toArray();
    return result[0] || null;
  } catch (error) {
    throw new Error(error);
  }
};

// push columnId vào cuối mảng orderIds của board
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: column.boardId,
        },
        {
          $push: { columnOrderIds: column._id },
        },
        {
          returnDocument: "after",
        }
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(column.boardId.toString()),
        },
        {
          $pull: { columnOrderIds: column._id },
        },
        {
          returnDocument: "after",
        }
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (boardId, data) => {
  try {
    Object.keys(data).forEach((fieldName) => {
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
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(boardId),
        },
        {
          $set: data,
        },
        {
          returnDocument: "after",
        }
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = {
  BoardModal: {
    BOARD_COLLECTION_NAME,
    BOARD_COLLECTION_SCHEMA,
    newModal,
    findOneById,
    getDetail,
    pushColumnOrderIds,
    update,
    pullColumnOrderIds,
  },
};
