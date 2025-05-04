const Joi = require("joi");
const { StatusCodes } = require("http-status-codes");
const ApiError = require("@/utils/ApiError");
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

module.exports = {
  BoardValidation: {
    createNew,
  },
};
