const {
  ColumnController
} = require("@/controllers/ColumnController");
const {
  ColumnValidation
} = require("@/validations/ColumnValidation");
const {
  authMiddleware
} = require("@/middlewares/authMiddleware");
const express = require("express");
const Router = express.Router();
Router.route("/").post(authMiddleware.isAuthorized, ColumnValidation.newColumn, ColumnController.newColumn);
Router.route("/:id").put(authMiddleware.isAuthorized, ColumnValidation.update, ColumnController.update).delete(authMiddleware.isAuthorized, ColumnValidation.deleteItem, ColumnController.deleteItem);
module.exports = {
  ColumnRoute: Router
};