const {
  ColumnService
} = require("@/services/ColumnService");
const {
  StatusCodes
} = require("http-status-codes");
const newColumn = async (req, res, next) => {
  try {
    const newColumn = await ColumnService.newColumn(req.body);
    res.status(StatusCodes.CREATED).json(newColumn);
  } catch (error) {
    next(error);
  }
};
const update = async (req, res, next) => {
  try {
    const updatedColumn = await ColumnService.update(req.params.id, req.body);
    res.status(StatusCodes.OK).json(updatedColumn);
  } catch (error) {
    next(error);
  }
};
const deleteItem = async (req, res, next) => {
  try {
    const deletedColumn = await ColumnService.deleteItem(req.params.id);
    res.status(StatusCodes.OK).json(deletedColumn);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  ColumnController: {
    newColumn,
    update,
    deleteItem
  }
};