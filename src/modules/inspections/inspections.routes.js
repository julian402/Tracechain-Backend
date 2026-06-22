import { Router } from 'express'
import {
  createVisitController,
  getAllVisitsController,
  getVisitByIdController,
  getVisitsByLotController,
  updateVisitStatusController
} from './inspections.controller.js'
import { authenticate, requirePermission, requireFeature } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { createVisitDto, updateVisitStatusDto } from './inspections.dto.js'

const router = Router()

router.get('/', authenticate, requirePermission('inspections:read'), requireFeature('inspections'), getAllVisitsController)
router.get('/:id', authenticate, requirePermission('inspections:read'), requireFeature('inspections'), getVisitByIdController)
router.get('/lot/:lotId', authenticate, requirePermission('inspections:read'), requireFeature('inspections'), getVisitsByLotController)
router.post('/', authenticate, requirePermission('inspections:create'), requireFeature('inspections'), validate(createVisitDto), createVisitController)
router.patch('/:id/status', authenticate, requirePermission('inspections:update'), requireFeature('inspections'), validate(updateVisitStatusDto), updateVisitStatusController)

export default router
