import express from 'express'
import { invitationValidation } from '../../validations/invitationValidation.js'
import { invitationController } from '../../controllers/invitationController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'

const Router = express.Router()

Router.route('/board')
  .post(authMiddleware.isAuthorized, invitationValidation.createNewBoardInvitation, invitationController.createNewBoardInvitation)

Router.route('/board/:invitationId')
  .put(authMiddleware.isAuthorized, invitationController.updateBoardInvitation)

Router.route('/')
  .get(authMiddleware.isAuthorized, invitationController.getInvitations)

export const invitationRoute = Router