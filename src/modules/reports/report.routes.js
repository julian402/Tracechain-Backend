import { Router } from 'express'
import {
  exportLotsCSVController,
  exportMovementsCSVController,
  exportLotsPDFController
} from './report.controller.js'
import { authenticate, authorize } from '../../middlewares/auth.js'

const router = Router()

router.get('/lots/csv', authenticate, authorize('ADMIN', 'AUDITOR'), exportLotsCSVController)
router.get('/lots/pdf', authenticate, authorize('ADMIN', 'AUDITOR'), exportLotsPDFController)
router.get('/movements/csv', authenticate, authorize('ADMIN', 'AUDITOR'), exportMovementsCSVController)

export default router