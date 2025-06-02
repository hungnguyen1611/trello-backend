const ApiError = require("@/utils/ApiError");
const { StatusCodes } = require("http-status-codes");
const Joi = require("joi");

const createNewBoardInvitation = async (req, res, next) => {
  const correctCondition = Joi.object({
    inviteeEmail: Joi.string().required(),
    boardId: Joi.string().required(),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

module.exports = {
  invitationValidation: {
    createNewBoardInvitation,
  },
};
