const { BoardService } = require("@/services/BoardService");

const { StatusCodes } = require("http-status-codes");

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;

    //  Điều hướng sang severvice
    const createBoard = await BoardService.createNew(userId, req.body);

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
    const userId = req.jwtDecoded._id;
    const boardId = req.params.id;

    const board = await BoardService.getDetail(userId, boardId);

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

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;

    // Lấy thông tin phân trang từ query
    const { page, itemsPerPage, q } = req.query;

    const queryFilters = q;

    const results = await BoardService.getBoards(
      userId,
      page,
      itemsPerPage,
      queryFilters
    );

    res.status(StatusCodes.OK).json(results);
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
    getBoards,
  },
};
