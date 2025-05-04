// const { BoardValidation } = require("@/validations/BoardValidation");
const {
  BoardController
} = require("@/controllers/BoardController");
const {
  BoardValidation
} = require("@/validations/BoardValidation");
const express = require("express");
const {
  StatusCodes
} = require("http-status-codes");
const Router = express.Router();
Router.route("/:id").get((req, res) => {
  res.status(StatusCodes.OK).json({
    message: "GET: Api get list board",
    code: StatusCodes.OK
  });
}).post(BoardValidation.createNew, BoardController.createNew);
module.exports = {
  BoardRoutes: Router
};