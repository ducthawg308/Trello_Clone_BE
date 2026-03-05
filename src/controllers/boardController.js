import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

const createNew = async (req, res, next) => {
  try {
    console.log('req.body: ', req.body)
    res.status(StatusCodes.CREATED).json({ message: 'POST form Controller' })
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew
}