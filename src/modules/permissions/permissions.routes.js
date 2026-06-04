import { Router } from 'express'
import { getPermissionsController } from './permissions.controller.js'
import { authenticate, requirePermission } from '../../middlewares/auth.js'

const router = Router()

router.get('/', authenticate, requirePermission('roles:read', 'roles:manage'), getPermissionsController)

export default router
