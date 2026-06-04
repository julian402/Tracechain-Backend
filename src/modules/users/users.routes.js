import { Router } from 'express'
import {
  getAllUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  promoteToSuperAdminController,
  changePasswordController,
  deleteUserController
} from './users.controller.js'
import { authenticate, requirePermission, requireSuperAdmin } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { createUserDto, updateUserDto, changePasswordDto } from './users.dto.js'

const router = Router()

router.get('/', authenticate, requirePermission('users:read'), getAllUsersController)
router.get('/:id', authenticate, requirePermission('users:read'), getUserByIdController)
router.post('/', authenticate, requirePermission('users:manage'), validate(createUserDto), createUserController)
// PATCH sin requirePermission: el propio usuario puede editar su nombre/email;
// la gestión de roles/otros usuarios se valida dentro del controlador.
router.patch('/:id', authenticate, validate(updateUserDto), updateUserController)
router.patch('/:id/super-admin', authenticate, requireSuperAdmin, promoteToSuperAdminController)
router.patch('/:id/password', authenticate, validate(changePasswordDto), changePasswordController)
router.delete('/:id', authenticate, requirePermission('users:manage'), deleteUserController)

export default router
