import { startRegistration, verifyRegistration, resendRegistrationOtp, login, verifyOtp, resendOtp, getCurrentSession } from './auth.service.js'
import { successResponse } from '../../shared/response.helper.js'

export const registerController = async (req, res, next) => {
  try {
    const result = await startRegistration(req.body)
    successResponse(res, result, 200)
  } catch (error) {
    next(error)
  }
}

export const verifyRegistrationController = async (req, res, next) => {
  try {
    const result = await verifyRegistration(req.body)
    successResponse(res, result, 201)
  } catch (error) {
    next(error)
  }
}

export const resendRegistrationController = async (req, res, next) => {
  try {
    const result = await resendRegistrationOtp(req.body)
    successResponse(res, result)
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

export const verifyOtpController = async (req, res, next) => {
  try {
    const result = await verifyOtp(req.body)
    successResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const resendOtpController = async (req, res, next) => {
  try {
    const result = await resendOtp(req.body)
    successResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const meController = async (req, res, next) => {
  try {
    const result = await getCurrentSession(req.user.id)
    successResponse(res, result)
  } catch (error) {
    next(error)
  }
}
