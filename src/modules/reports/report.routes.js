import { Router } from 'express'
import {
  exportLotsCSVController,
  exportMovementsCSVController,
  exportLotsPDFController
} from './report.controller.js'
import { authenticate, requirePermission, requireFeature } from '../../middlewares/auth.js'

const router = Router()

router.get('/lots/csv', authenticate, requirePermission('reports:read'), requireFeature('reports'), exportLotsCSVController)
router.get('/lots/pdf', authenticate, requirePermission('reports:read'), requireFeature('reports'), exportLotsPDFController)
router.get('/movements/csv', authenticate, requirePermission('reports:read'), requireFeature('reports'), exportMovementsCSVController)

export default router
