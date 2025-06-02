const Joi = require("joi");
const { StatusCodes } = require("http-status-codes");
const ApiError = require("@/utils/ApiError");
const { BOARD_TYPE } = require("@/utils/constant");
const {
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
} = require("@/utils/validators");
// const { env } = require("@/configs/environment");

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    //  trim phải đi cùng với strict
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      //  custom mesage defauld of joi
      "any.required": "Title is required (hungnguyen)",
      "string.min": "Title min 3 chars (hungnguyen)",
      "string.empty": "Title is not allowed to be empty (hungnguyen)",
      "string.trim":
        "Title must not have leading or trainling whitespace (hungnguyen)",
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPE.PRIVATE, BOARD_TYPE.PUBLIC).required(),
  });

  try {
    //  Chỉ abortEarly : false để trường hợp có nhiều lỗi validation sẽ trả về tất cả các lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    //  Validate dữ liệu hợp lệ thì request đến controller
    next();
  } catch (error) {
    // const errorMessage = new Error(err).message;
    // const errorCustom = ApiError(
    //   StatusCodes.UNPROCESSABLE_ENTITY,
    //   errorMessage
    // );

    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

const update = async (req, res, next) => {
  //  Không required với dữ liệu update
  //  Đối với trường hợp update cho phép UnKnown để không cần đầy một số field
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPE.PRIVATE, BOARD_TYPE.PUBLIC),
    columnOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),
  });
  // allowUnknown: true: Cho phép object chứa các key không được định nghĩa trong schema.
  // abortEarly: false: Joi sẽ tiếp tục kiểm tra toàn bộ schema → trả về tất cả các lỗi nếu có.

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

const moveCardToDifferentColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    currentCardId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    nextColumnId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array()
      .required()
      .items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
      ),
    nextCardOrderIds: Joi.array()
      .required()
      .items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
      ),
  });

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
    });
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

module.exports = {
  BoardValidation: {
    createNew,
    update,
    moveCardToDifferentColumn,
  },
};
