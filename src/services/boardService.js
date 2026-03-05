import ApiError from '../utils/ApiError.js'
import { slugify } from '../utils/formatters.js'

const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    return newBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}