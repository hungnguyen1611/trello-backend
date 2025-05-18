const { StatusCodes } = require("http-status-codes");
const createNew = async (req, res, next) => {
  try {
    // res.status(StatusCodes.CREATED).json({
    //     message: "POST: Api post list board",
    //     code: StatusCodes.CREATED,
    //   });
    // console.log("req.body", req.body);
    // console.log("req.query", req.query);
    // console.log("req.param", req.params.id);
    // throw new ApiError(StatusCodes.BAD_GATEWAY, "Testing handling error");
    // throw new Error("hungnguyen testing error");

    res.status(StatusCodes.CREATED).json({
      message: "POST from controller: API create new post",
    });
  } catch (error) {
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    //   errors: error.message,
    // });
    next(error);
  }
};
module.exports = {
  BoardController: {
    createNew,
  },
};
