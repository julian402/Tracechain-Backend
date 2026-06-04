import { Router } from 'express'
import { getDashboardStatsController } from './stats.controller.js'
import { authenticate, requirePermission } from '../../middlewares/auth.js'

const router = Router()

router.get('/dashboard', authenticate, requirePermission('dashboard:read'), getDashboardStatsController)

export default router
