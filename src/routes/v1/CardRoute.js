const { CardController } = require("@/controllers/CardController");
const { CardValidation } = require("@/validations/CardValidation");
const { authMiddleware } = require("@/middlewares/authMiddleware");

const express = require("express");

const Router = express.Router();

Router.route("/").post(
  authMiddleware.isAuthorized,
  CardValidation.newCard,
  CardController.newCard
);

module.exports = {
  CardRoute: Router,
};
