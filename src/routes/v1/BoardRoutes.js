// const { BoardValidation } = require("@/validations/BoardValidation");
const { BoardController } = require("@/controllers/BoardController");
const { authMiddleware } = require("@/middlewares/authMiddleware");
const { BoardValidation } = require("@/validations/BoardValidation");
const express = require("express");
const { StatusCodes } = require("http-status-codes");

const Router = express.Router();

Router.route("/")
  .get(authMiddleware.isAuthorized, (req, res) => {
    res
      .status(StatusCodes.OK)
      .json({ message: "GET: Api get list board", code: StatusCodes.OK });
  })
  .post(BoardValidation.createNew, BoardController.createNew);

Router.route("/:id")
  .get(authMiddleware.isAuthorized, BoardController.getDetails)
  .put(
    authMiddleware.isAuthorized,
    BoardValidation.update,
    BoardController.updata
  );

Router.route("/supports/moving_card").put(
  authMiddleware.isAuthorized,
  BoardValidation.moveCardToDifferentColumn,
  BoardController.moveCardToDifferentColumn
);

module.exports = {
  BoardRoute: Router,
};
