const express = require("express");
const { userController } = require("@/controllers/UserController");
const { userValidation } = require("@/validations/UserValidation");

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

module.exports = {
  userRoute: Router,
};
