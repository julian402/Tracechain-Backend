import { Router } from 'express'
import {
  getAllSuppliersController,
  getSupplierByIdController,
  createSupplierController,
  updateSupplierController,
  deleteSupplierController
} from './suppliers.controller.js'
import { authenticate, requirePermission } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { createSupplierDto, updateSupplierDto } from './suppliers.dto.js'

const router = Router()

router.get('/', authenticate, requirePermission('inventory:read'), getAllSuppliersController)
router.get('/:id', authenticate, requirePermission('inventory:read'), getSupplierByIdController)
router.post('/', authenticate, requirePermission('inventory:create'), validate(createSupplierDto), createSupplierController)
router.patch('/:id', authenticate, requirePermission('inventory:update'), validate(updateSupplierDto), updateSupplierController)
router.delete('/:id', authenticate, requirePermission('inventory:delete'), deleteSupplierController)

export default router
