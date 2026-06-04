import { Router } from 'express'
import {
  createLotController,
  getAllLotsController,
  getLotByIdController,
  getPublicLotController,
  changeLotStatusController,
  getLotsByFiltersController,
  getLotTreeController,
  updateLotController
} from './lot.controller.js'
import { authenticate, requirePermission, enforceLotLimit } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { createLotDto, updateLotStatusDto, updateLotDto } from './lot.dto.js'

const router = Router()

// publica — sin token
router.get('/public/:qrCode', getPublicLotController)

router.get('/search', authenticate, requirePermission('lots:read'), getLotsByFiltersController)

// protegidas
router.get('/:id/tree', authenticate, requirePermission('lots:read'), getLotTreeController)
router.get('/', authenticate, requirePermission('lots:read'), getAllLotsController)
router.get('/:id', authenticate, requirePermission('lots:read'), getLotByIdController)
router.post('/', authenticate, requirePermission('lots:create'), enforceLotLimit, validate(createLotDto), createLotController)
router.patch('/:id/status', authenticate, requirePermission('lots:update'), validate(updateLotStatusDto), changeLotStatusController)
router.patch('/:id', authenticate, requirePermission('lots:update'), validate(updateLotDto), updateLotController)


export default router
