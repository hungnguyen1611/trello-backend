const { GET_DB } = require("@/configs/mongodb");
const { EMAIL_RULE, EMAIL_RULE_MESSAGE } = require("@/utils/validators");
const Joi = require("joi");
const { ObjectId } = require("mongodb");

const USER_ROLES = {
  CLIENT: "client",
  ADMIN: "admin",
};
const USER_COLLECTION_NAME = "users";
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string()
    .valid(USER_ROLES.CLIENT, USER_ROLES.ADMIN)
    .default(USER_ROLES.CLIENT),
  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),
  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = ["_id", "email", "username", "createdAt"];

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const createUser = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);
    const newUSer = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .insertOne(validData);
    return newUSer;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (userId) => {
  // console.log("🚀 ~ findOneById ~ userId:", userId);

  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({
        _id: ObjectId.createFromHexString(userId.toString()),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneByEmail = async (emailValue) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      email: emailValue,
    });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (userId, dataUpdate) => {
  try {
    Object.keys(dataUpdate).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete dataUpdate[fieldName];
      }
    });

    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(userId),
        },
        {
          $set: dataUpdate,
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
  userModel: {
    USER_COLLECTION_NAME,
    createUser,
    createUser,
    findOneById,
    findOneByEmail,
    update,
  },
};
