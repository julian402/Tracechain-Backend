import { Router } from 'express'
import {
  getPlansController,
  getPlanCatalogController,
  getPlanController,
  createPlanController,
  updatePlanController,
  deletePlanController,
} from './plans.controller.js'
import { authenticate, requireSuperAdmin } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { createPlanDto, updatePlanDto } from './plans.dto.js'

const router = Router()

// Lectura: cualquier usuario autenticado (la página de planes/billing las usa).
router.get('/', authenticate, getPlansController)
router.get('/catalog', authenticate, getPlanCatalogController)
router.get('/:id', authenticate, getPlanController)

// Gestión: exclusiva del super admin (plataforma).
router.post('/', authenticate, requireSuperAdmin, validate(createPlanDto), createPlanController)
router.patch('/:id', authenticate, requireSuperAdmin, validate(updatePlanDto), updatePlanController)
router.delete('/:id', authenticate, requireSuperAdmin, deletePlanController)

export default router
