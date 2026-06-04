import { Router } from 'express'
import { getQrController } from './qr.controller.js'
import { authenticate, requirePermission } from '../../middlewares/auth.js'

const router = Router()

router.get('/:qrCode', authenticate, requirePermission('lots:read'), getQrController)

export default router
