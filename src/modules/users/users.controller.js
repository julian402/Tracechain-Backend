import {
  getAllUsers,
  getUserById,
  updateUserService,
  changePassword,
  deleteUserService
} from './users.service.js'
import { successResponse } from '../../shared/response.helper.js'

export const getAllUsersController = async (req, res, next) => {
  try {
    const users = await getAllUsers()
    successResponse(res, users)
  } catch (error) {
    next(error)
  }
}

export const getUserByIdController = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id)
    successResponse(res, user)
  } catch (error) {
    next(error)
  }
}

export const updateUserController = async (req, res, next) => {
  try {
    const isOwn = req.user.id === req.params.id
    const isAdmin = req.user.role === 'ADMIN'
    if (!isOwn && !isAdmin) {
      return next(new (await import('../../shared/appError.js')).AppError('No autorizado', 403))
    }
    const user = await updateUserService(req.params.id, req.body, req.user.role)
    successResponse(res, user)
  } catch (error) {
    next(error)
  }
}

export const changePasswordController = async (req, res, next) => {
  try {
    await changePassword(req.params.id, req.body)
    successResponse(res, { message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    next(error)
  }
}

export const deleteUserController = async (req, res, next) => {
  try {
    await deleteUserService(req.params.id)
    successResponse(res, { message: 'Usuario eliminado correctamente' })
  } catch (error) {
    next(error)
  }
}