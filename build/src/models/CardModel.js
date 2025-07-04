const {
  GET_DB
} = require("@/configs/mongodb");
const {
  OBJECT_ID_RULE,
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE
} = require("@/utils/validators");
const {
  OBJECT_ID_RULE_MESSAGE
} = require("@/utils/validators");
const Joi = require("joi");
const {
  ObjectId,
  ReturnDocument
} = require("mongodb");
const {
  ColumnModel
} = require("./ColumnModel");
const {
  CARD_MEMBER_ACTIONS
} = require("@/utils/constant");
const {
  result
} = require("lodash");
const INVALID_UPDATE_FIELD = ["_id", "createAt", "boarId"];

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = "cards";
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  slug: Joi.string().required().min(3).trim().strict(),
  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),
  cover: Joi.string().default(null),
  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  comments: Joi.array().items(Joi.object({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    // Ghi chú: không dùng default Date.now vì đây dùng hàm $push nên không dùng đươc giống như khi dùng insert
    commentedAt: Joi.date().timestamp()
  })).default([]),
  cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)),
  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false)
});
const validateBeforeCreate = async data => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  });
};
const newCard = async data => {
  try {
    const validateData = await validateBeforeCreate(data);
    const validateDataConfig = {
      ...validateData,
      boardId: ObjectId.createFromHexString(validateData.boardId),
      columnId: ObjectId.createFromHexString(validateData.columnId)
    };
    const createCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(validateDataConfig);
    return createCard;
  } catch (error) {
    throw new Error(err);
  }
};
const findOneById = async id => {
  const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
    _id: ObjectId.createFromHexString(id)
  });
  return result;
};
const update = async (cardId, data) => {
  try {
    Object.keys(data).forEach(fieldName => {
      if (INVALID_UPDATE_FIELD.includes(fieldName)) {
        delete data[fieldName];
      }
    });
    //  config chỗ này sau này nhiều trường hợp có thể tách sang func riêng
    if (data.columnId) data.columnId = ObjectId.createFromHexString(data.columnId);
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate({
      _id: ObjectId.createFromHexString(cardId)
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
const deleteManyByColumnId = async columnId => {
  const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({
    columnId: ObjectId.createFromHexString(columnId)
  });
  return result;
};

// Đây một phần tự comment vào đầu mảng comments!
// Trong JS, ngược lại với push (thêm phần tử vào cuối mảng) sẽ là unshift (thêm phần tử vào đầu mảng)
// Nhưng trong mongodb hiện tại chỉ có push – mặc định đẩy phần tử vào cuối mảng.
// Dĩ nhiên có thể vừa push vào đầu mảng cũng được, nhưng nay sẽ học cách để thêm phần tử vào đầu mảng trong mongodb.
// Vẫn dùng $push, nhưng bọc data vào Array để trong $each và chỉ định $position: 0
// https://www.mongodb.com/docs/manual/reference/operator/update/position/
const unshiftNewComment = async (cardId, commentData) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate({
      _id: ObjectId.createFromHexString(cardId)
    }, {
      $push: {
        comments: {
          $each: [commentData],
          $position: 0
        }
      }
    }, {
      returnDocument: "after"
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const updateMembers = async (cardId, icomingMemberInfo) => {
  try {
    let updateCondition = {};
    if (icomingMemberInfo.action === CARD_MEMBER_ACTIONS.ADD) {
      updateCondition = {
        $push: {
          memberIds: ObjectId.createFromHexString(icomingMemberInfo.userId)
        }
      };
    }
    if (icomingMemberInfo.action === CARD_MEMBER_ACTIONS.REMOVE) {
      updateCondition = {
        $pull: {
          memberIds: ObjectId.createFromHexString(icomingMemberInfo.userId)
        }
      };
    }
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate({
      _id: ObjectId.createFromHexString(cardId)
    }, updateCondition, {
      returnDocument: "after"
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = {
  CardModel: {
    CARD_COLLECTION_NAME,
    CARD_COLLECTION_SCHEMA,
    newCard,
    findOneById,
    update,
    deleteManyByColumnId,
    unshiftNewComment,
    updateMembers
  }
};