import { Router } from 'express'
import {
  createOrganizationController,
  getOrganizationsController,
  getMyOrganizationController,
  updateMyOrganizationController,
  getOrganizationController,
  changeOrganizationPlanController,
  changeOrganizationStatusController,
} from './organizations.controller.js'
import { authenticate, requireSuperAdmin, requirePermission } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { createOrgDto, changePlanDto, changeStatusDto, updateOrgDto } from './organizations.dto.js'

const router = Router()

/**
 * @swagger
 * /api/organizations/me:
 *   get:
 *     summary: Datos de la propia organización (plan, límites y uso)
 *     tags: [Organizations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Organización del usuario }
 */
// Cualquier usuario autenticado puede leer su propia organización (billing / uso).
router.get('/me', authenticate, getMyOrganizationController)
router.patch('/me', authenticate, requirePermission('users:manage'), validate(updateOrgDto), updateMyOrganizationController)

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: Lista todas las organizaciones (plataforma)
 *     tags: [Organizations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Listado de organizaciones }
 *       403: { description: Acceso restringido a la plataforma }
 */
router.post('/', authenticate, requireSuperAdmin, validate(createOrgDto), createOrganizationController)
router.get('/', authenticate, requireSuperAdmin, getOrganizationsController)
router.get('/:id', authenticate, requireSuperAdmin, getOrganizationController)
router.patch('/:id/plan', authenticate, requireSuperAdmin, validate(changePlanDto), changeOrganizationPlanController)
router.patch('/:id/status', authenticate, requireSuperAdmin, validate(changeStatusDto), changeOrganizationStatusController)

export default router
