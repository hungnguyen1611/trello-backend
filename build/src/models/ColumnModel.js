const {
  GET_DB
} = require("@/configs/mongodb");
const {
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE
} = require("@/utils/validators");
const Joi = require("joi");
const {
  ObjectId
} = require("mongodb");
const COLUMN_COLLECTION_NAME = "columns";
const INVALID_UPDATE_FIELD = ["_id", "createAt", "boarId"];
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().min(3).max(255).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  // item trong mảng cardOrderIds là ObjectId nên cần thêm pattern
  cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createAt: Joi.date().timestamp("javascript").default(Date.now),
  updateAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false)
});
const validateBeforeCreate = async data => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  });
};
const newColumn = async data => {
  const validateData = await validateBeforeCreate(data);
  const validateDataConfig = {
    ...validateData,
    boardId: ObjectId.createFromHexString(validateData.boardId)
  };
  try {
    const newColumn = await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(validateDataConfig);
    return newColumn;
  } catch (error) {
    throw new Error(error);
  }
};
const findOneById = async _id => {
  const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({
    _id: ObjectId.createFromHexString(_id)
  });
  return result;
};
const pushCardOrderIds = async card => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate({
      _id: card.columnId
    }, {
      $push: {
        cardOrderIds: card._id
      }
    }, {
      returnDocument: "after"
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const update = async (columnId, data) => {
  try {
    Object.keys(data).forEach(fieldName => {
      if (INVALID_UPDATE_FIELD.includes(fieldName)) {
        delete data[fieldName];
      }
    });
    if (data.cardOrderIds) {
      data.cardOrderIds = data.cardOrderIds.map(_id => ObjectId.createFromHexString(_id));
    }
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate({
      _id: ObjectId.createFromHexString(columnId)
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
const deleteOneById = async id => {
  const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).deleteOne({
    _id: ObjectId.createFromHexString(id)
  });
  return result;
};
module.exports = {
  ColumnModel: {
    COLUMN_COLLECTION_NAME,
    COLUMN_COLLECTION_SCHEMA,
    newColumn,
    findOneById,
    pushCardOrderIds,
    update,
    deleteOneById
  }
};