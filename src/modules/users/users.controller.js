import {
  getAllUsers,
  getAllUsersGlobal,
  getUserById,
  createUserService,
  updateUserService,
  promoteToSuperAdminService,
  changePassword,
  deleteUserService
} from './users.service.js'
import { successResponse } from '../../shared/response.helper.js'

const canManageUsers = (req) =>
  req.user.isSuperAdmin || req.user.permissionKeys?.includes('users:manage')

export const getAllUsersController = async (req, res, next) => {
  try {
    // scope=all: vista global para la página de plataforma (/admin/users — solo super admin)
    if (req.user.isSuperAdmin && req.query.scope === 'all') {
      return successResponse(res, await getAllUsersGlobal())
    }
    // Vista org-level: scoped a la org del usuario (incluye super admin → su org propia)
    const users = await getAllUsers(req.organizationId)
    successResponse(res, users)
  } catch (error) {
    next(error)
  }
}

export const getUserByIdController = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id, req.organizationId, req.user.isSuperAdmin)
    successResponse(res, user)
  } catch (error) {
    next(error)
  }
}

export const createUserController = async (req, res, next) => {
  try {
    const user = await createUserService(req.body, {
      organizationId: req.organizationId,
      plan: req.user.plan,
      isSuperAdmin: req.user.isSuperAdmin,
    })
    successResponse(res, user, 201)
  } catch (error) {
    next(error)
  }
}

export const updateUserController = async (req, res, next) => {
  try {
    const user = await updateUserService(req.params.id, req.body, {
      organizationId: req.organizationId,
      canManage: canManageUsers(req),
      requestorId: req.user.id,
      isSuperAdmin: req.user.isSuperAdmin,
    })
    successResponse(res, user)
  } catch (error) {
    next(error)
  }
}

export const promoteToSuperAdminController = async (req, res, next) => {
  try {
    const user = await promoteToSuperAdminService(req.params.id, req.user.isSuperAdmin)
    successResponse(res, user)
  } catch (error) {
    next(error)
  }
}

export const changePasswordController = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      const { AppError } = await import('../../shared/AppError.js')
      throw new AppError('No autorizado', 403)
    }
    await changePassword(req.params.id, req.body)
    successResponse(res, { message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    next(error)
  }
}

export const deleteUserController = async (req, res, next) => {
  try {
    await deleteUserService(req.params.id, req.organizationId, req.user.isSuperAdmin)
    successResponse(res, { message: 'Usuario eliminado correctamente' })
  } catch (error) {
    next(error)
  }
}
