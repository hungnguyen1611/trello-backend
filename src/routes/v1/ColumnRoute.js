const { ColumnController } = require("@/controllers/ColumnController");
const { ColumnValidation } = require("@/validations/ColumnValidation");
const express = require("express");

const Router = express.Router();

Router.route("/").post(ColumnValidation.newColumn, ColumnController.newColumn);

Router.route("/:id")
  .put(ColumnValidation.update, ColumnController.update)
  .delete(ColumnValidation.deleteItem, ColumnController.deleteItem);

module.exports = {
  ColumnRoute: Router,
};
