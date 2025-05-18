const { BoardModal } = require("@/models/BoardModel");
const { CardModel } = require("@/models/CardModel");
const { ColumnModel } = require("@/models/ColumnModel");
const ApiError = require("@/utils/ApiError");
const { slugify } = require("@/utils/formatters");
const { StatusCodes } = require("http-status-codes");
const { cloneDeep } = require("lodash");

const createNew = async (data) => {
  try {
    const newData = {
      ...data,
      slug: slugify(data.title),
    };

    //  Gọi tần model để xử lí lưu bản ghi newBoard vào data

    //  Làm thêm các xử lí khác với các Collection khác tùy vào dự án
    // Bắn email, notification về cho admin khi có boar mới được tạo

    const newBoard = await BoardModal.newModal(newData);
    const getNewBoard = await BoardModal.findOneById(
      newBoard.insertedId.toString()
    );
    return getNewBoard;
  } catch (error) {
    throw error;
  }
};

const getDetail = async (boardId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const board = await BoardModal.getDetail(boardId);

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Board not found");
    }

    const resBoard = cloneDeep(board);

    //  equals is method supported by mongodb for objectId
    resBoard.columns.forEach(
      (column) =>
        (column.cards = resBoard.cards.filter((card) =>
          card.columnId.equals(column._id)
        ))
    );

    delete resBoard.cards;

    //  Method 2
    //  use method of javascript

    // resBoard.columns.forEach(
    //   (column) =>
    //     (column.cards = board.cards.filter(
    //       (card) => card.columnId.toString() === column._id.toString()
    //     ))
    // );

    return resBoard;
  } catch (error) {
    throw error;
  }
};

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now(),
    };

    const updatedBoard = await BoardModal.update(boardId, updateData);
    return updatedBoard;
  } catch (error) {
    throw error;
  }
};

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    await ColumnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updateAt: Date.now(),
    });

    await ColumnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updateAt: Date.now(),
    });

    await CardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
      updateAt: Date.now(),
    });
    return { updateResult: "Successfully" };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  BoardService: {
    createNew,
    getDetail,
    update,
    moveCardToDifferentColumn,
  },
};
