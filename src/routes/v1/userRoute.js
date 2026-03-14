import express from 'express'
import { userValidation } from '../../validations/userValidation.js'
import { userController } from '../../controllers/userController.js'

const Router = express.Router()

Router.route('/register')
  .post(userValidation.createNew, userController.createNew)

Router.route('/verify')
  .put(userValidation.verifyAccount, userController.verifyAccount)

Router.route('/login')
  .post(userValidation.login, userController.login)

export const userRoute = Router