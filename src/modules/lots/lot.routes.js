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
import { authenticate, authorize } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { createLotDto, updateLotStatusDto, updateLotDto } from './lot.dto.js'

const router = Router()

// publica — sin token
router.get('/public/:qrCode', getPublicLotController)

router.get('/search', authenticate, getLotsByFiltersController)

// protegidas
router.get('/:id/tree', authenticate, getLotTreeController)
router.get('/', authenticate, getAllLotsController)
router.get('/:id', authenticate, getLotByIdController)
router.post('/', authenticate, authorize('ADMIN', 'OPERATOR'), validate(createLotDto), createLotController)
router.patch('/:id/status', authenticate, authorize('ADMIN', 'OPERATOR'), validate(updateLotStatusDto), changeLotStatusController)
router.patch('/:id', authenticate, authorize('ADMIN', 'OPERATOR'), validate(updateLotDto), updateLotController)


export default router