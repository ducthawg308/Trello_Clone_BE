import express from 'express'
import { userValidation } from '../../validations/userValidation.js'
import { userController } from '../../controllers/userController.js'

const Router = express.Router()

Router.route('/register')
  .post(userValidation.createNew, userController.createNew)

export const userRoute = Router