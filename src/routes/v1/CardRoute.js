const { CardController } = require("@/controllers/CardController");
const { CardValidation } = require("@/validations/CardValidation");
const express = require("express");

const Router = express.Router();

Router.route("/").post(CardValidation.newCard, CardController.newCard);

module.exports = {
  CardRoute: Router,
};
