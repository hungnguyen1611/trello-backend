const CardController = require("@/controllers/CardController");
const {
  BoardModal
} = require("@/models/BoardModel");
const {
  CardModel
} = require("@/models/CardModel");
const {
  ColumnModel
} = require("@/models/ColumnModel");
const ApiError = require("@/utils/ApiError");
const {
  slugify
} = require("@/utils/formatters");
const {
  StatusCodes
} = require("http-status-codes");
const newColumn = async data => {
  try {
    const newData = {
      ...data,
      slug: slugify(data.title)
    };
    const newColumn = await ColumnModel.newColumn(newData);
    //  Nếu dùng ObjectId.createFromHexString(id) thì cần phải .toString() thì kiểu dữ liệu mới hợp lệ
    const getNewColumn = await ColumnModel.findOneById(newColumn.insertedId.toString());
    if (getNewColumn) {
      // Tạo thêm field cards trước khi trả về cho client
      getNewColumn.cards = [];
      await BoardModal.pushColumnOrderIds(getNewColumn);
    }
    return getNewColumn;
  } catch (error) {
    throw error;
  }
};
const update = async (ColumnId, data) => {
  try {
    const updateData = {
      ...data,
      updateAt: Date.now()
    };
    const updatedColumn = await ColumnModel.update(ColumnId, updateData);
    return updatedColumn;
  } catch (error) {
    throw error;
  }
};
const deleteItem = async ColumnId => {
  try {
    const targetColumn = await ColumnModel.findOneById(ColumnId);
    if (!targetColumn) throw new ApiError(StatusCodes.NOT_FOUND, "Column Not Found!");

    //  Xóa columnId trong columnOrderIds
    await BoardModal.pullColumnOrderIds(targetColumn);

    // Xóa column
    await ColumnModel.deleteOneById(ColumnId);

    // Xóa card thuộc column
    await CardModel.deleteManyByColumnId(ColumnId);
    return {
      resultDelete: "Delete Column Success"
    };
  } catch (error) {
    throw error;
  }
};
module.exports = {
  ColumnService: {
    newColumn,
    update,
    deleteItem
  }
};