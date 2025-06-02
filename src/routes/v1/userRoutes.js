const express = require("express");
const { userController } = require("@/controllers/UserController");
const { userValidation } = require("@/validations/UserValidation");
const { authMiddleware } = require("@/middlewares/authMiddleware");
const {
  multerUploadMiddlewares,
} = require("@/middlewares/multerUploadMiddlewares");

const Router = express.Router();

Router.route("/register").post(
  userValidation.createUser,
  userController.createUser
);

Router.route("/verify").put(
  userValidation.verifyAccount,
  userController.verifyAccount
);

Router.route("/login").post(userValidation.loggin, userController.login);

Router.route("/logout").delete(userController.logout);

Router.route("/refresh_token").get(userController.refresh_token);

Router.route("/update").put(
  authMiddleware.isAuthorized,
  multerUploadMiddlewares.upload.single("avatar"),
  userValidation.update,
  userController.update
);

module.exports = {
  userRoute: Router,
};
