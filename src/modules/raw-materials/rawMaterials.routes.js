import { Router } from 'express'
import {
  getAllRawMaterialsController,
  getRawMaterialByIdController,
  createRawMaterialController,
  updateRawMaterialController,
  deleteRawMaterialController
} from './rawMaterials.controller.js'
import { authenticate, requirePermission } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { createRawMaterialDto, updateRawMaterialDto } from './rawMaterials.dto.js'

const router = Router()

router.get('/', authenticate, requirePermission('inventory:read'), getAllRawMaterialsController)
router.get('/:id', authenticate, requirePermission('inventory:read'), getRawMaterialByIdController)
router.post('/', authenticate, requirePermission('inventory:create'), validate(createRawMaterialDto), createRawMaterialController)
router.patch('/:id', authenticate, requirePermission('inventory:update'), validate(updateRawMaterialDto), updateRawMaterialController)
router.delete('/:id', authenticate, requirePermission('inventory:delete'), deleteRawMaterialController)

export default router
