const {
  invitationController
} = require("@/controllers/invitationController");
const {
  authMiddleware
} = require("@/middlewares/authMiddleware");
const {
  invitationService
} = require("@/services/invitationService");
const {
  invitationValidation
} = require("@/validations/invitationValidation");
const express = require("express");
const Router = express.Router();
Router.route("/board").post(authMiddleware.isAuthorized, invitationValidation.createNewBoardInvitation, invitationController.createNewBoardInvitation);

// Get invitation by user
Router.route("/").get(authMiddleware.isAuthorized, invitationController.getInvitations);
Router.route("/board/:invitationId").put(authMiddleware.isAuthorized, invitationController.updateBoardInvitation);
module.exports = {
  invitationRoute: Router
};