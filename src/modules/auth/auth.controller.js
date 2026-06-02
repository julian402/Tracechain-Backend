import { register, login } from './auth.service.js'
import { successResponse } from '../../shared/response.helper.js'

export const registerController = async (req, res, next) => {
  try {
    const user = await register(req.body)
    successResponse(res, user, 201)
  } catch (error) {
    next(error)
  }
}

export const loginController = async (req, res, next) => {
  try {
    const result = await login(req.body)
    successResponse(res, result)
  } catch (error) {
    next(error)
  }
}