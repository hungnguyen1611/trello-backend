const { GET_DB } = require("@/configs/mongodb");
const { OBJECT_ID_RULE } = require("@/utils/validators");
const { OBJECT_ID_RULE_MESSAGE } = require("@/utils/validators");

const Joi = require("joi");
const { ObjectId, ReturnDocument } = require("mongodb");
const { ColumnModel } = require("./ColumnModel");
const INVALID_UPDATE_FIELD = ["_id", "createAt", "boarId"];

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = "cards";
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  slug: Joi.string().required().min(3).trim().strict(),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const newCard = async (data) => {
  try {
    const validateData = await validateBeforeCreate(data);
    const validateDataConfig = {
      ...validateData,
      boardId: ObjectId.createFromHexString(validateData.boardId),
      columnId: ObjectId.createFromHexString(validateData.columnId),
    };
    const createCard = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .insertOne(validateDataConfig);

    return createCard;
  } catch (error) {
    throw new Error(err);
  }
};

const findOneById = async (id) => {
  const result = await GET_DB()
    .collection(CARD_COLLECTION_NAME)

    .findOne({ _id: ObjectId.createFromHexString(id) });
  return result;
};

const update = async (cardId, data) => {
  try {
    Object.keys(data).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELD.includes(fieldName)) {
        delete data[fieldName];
      }
    });
    //  config chỗ này sau này nhiều trường hợp có thể tách sang func riêng
    if (data.columnId)
      data.columnId = ObjectId.createFromHexString(data.columnId);
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(cardId),
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

const deleteManyByColumnId = async (columnId) => {
  const result = await GET_DB()
    .collection(CARD_COLLECTION_NAME)

    .deleteMany({ columnId: ObjectId.createFromHexString(columnId) });

  return result;
};
module.exports = {
  CardModel: {
    CARD_COLLECTION_NAME,
    CARD_COLLECTION_SCHEMA,
    newCard,
    findOneById,
    update,
    deleteManyByColumnId,
  },
};
