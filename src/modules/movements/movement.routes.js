import { Router } from 'express'
import {
  createMovementController,
  getMovementsByLotController,
  getAllMovementsController
} from './movement.controller.js'
import { authenticate, requirePermission } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { createMovementDto } from './movement.dto.js'

const router = Router()

router.get('/', authenticate, requirePermission('movements:read'), getAllMovementsController)
router.get('/lot/:lotId', authenticate, requirePermission('movements:read'), getMovementsByLotController)
router.post('/', authenticate, requirePermission('movements:create'), validate(createMovementDto), createMovementController)

export default router
