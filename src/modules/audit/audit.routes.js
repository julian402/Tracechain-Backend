import { Router } from 'express'
import { authenticate, requirePermission } from '../../middlewares/auth.js'
import {
  getAllAuditLogsController,
  getAuditLogsByLotController,
  getAuditLogsByUserController,
  getAuditLogsByFiltersController
} from './audit.controller.js'

const router = Router()

router.get('/', authenticate, requirePermission('audit:read'), getAllAuditLogsController)
router.get('/lot/:lotId', authenticate, requirePermission('audit:read'), getAuditLogsByLotController)
router.get('/user/:userId', authenticate, requirePermission('audit:read'), getAuditLogsByUserController)
router.get('/search', authenticate, requirePermission('audit:read'), getAuditLogsByFiltersController)
export default router
