const express = require("express");
const {
  CardController
} = require("@/controllers/CardController");
const {
  CardValidation
} = require("@/validations/CardValidation");
const {
  authMiddleware
} = require("@/middlewares/authMiddleware");
const {
  multerUploadMiddlewares
} = require("@/middlewares/multerUploadMiddlewares");
const Router = express.Router();
Router.route("/").post(authMiddleware.isAuthorized, CardValidation.newCard, CardController.newCard);
Router.route("/:id").put(authMiddleware.isAuthorized, multerUploadMiddlewares.upload.single("cardCover"), CardValidation.update, CardController.update);
module.exports = {
  CardRoute: Router
};