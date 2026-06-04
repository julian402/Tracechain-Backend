import { Router } from 'express'
import {
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  changePasswordController,
  deleteUserController
} from './users.controller.js'
import { authenticate, authorize } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { updateUserDto, changePasswordDto } from './users.dto.js'

const router = Router()

router.get('/', authenticate, authorize('ADMIN'), getAllUsersController)
router.get('/:id', authenticate, getUserByIdController)
router.patch('/:id', authenticate, validate(updateUserDto), updateUserController)
router.patch('/:id/password', authenticate, validate(changePasswordDto), changePasswordController)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUserController)

export default router