const { BoardService } = require("@/services/BoardService");

const { StatusCodes } = require("http-status-codes");

const createNew = async (req, res, next) => {
  try {
    //  Điều hướng sang severvice

    const createBoard = await BoardService.createNew(req.body);

    res.status(StatusCodes.CREATED).json(
      // message: "POST from controller: API create new post",
      createBoard
    );
  } catch (error) {
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    //   errors: error.message,
    // });
    next(error);
  }
};

const getDetails = async (req, res, next) => {
  try {
    const board = await BoardService.getDetail(req.params.id);

    res.status(StatusCodes.OK).json(board);
  } catch (error) {
    next(error);
  }
};

const updata = async (req, res, next) => {
  try {
    const boardId = req.params.id;
    const updateBoard = await BoardService.update(boardId, req.body);
    res.status(StatusCodes.OK).json(updateBoard);
  } catch (error) {
    next(error);
  }
};

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const updated = await BoardService.moveCardToDifferentColumn(req.body);

    res.status(StatusCodes.OK).json(updated);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  BoardController: {
    createNew,
    getDetails,
    updata,
    moveCardToDifferentColumn,
  },
};
