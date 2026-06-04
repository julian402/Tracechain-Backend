import {
  listPlans,
  getPlan,
  createPlanService,
  updatePlanService,
  deletePlanService,
} from './plans.service.js'
import { successResponse } from '../../shared/response.helper.js'
import { PLAN_LIMITS, PLAN_FEATURES, BILLING_PERIODS } from '../../shared/plans.js'

export const getPlansController = async (req, res, next) => {
  try {
    // Usuarios no super admin solo ven planes activos (opciones para contratar).
    const activeOnly = !req.user?.isSuperAdmin
    const plans = await listPlans({ activeOnly })
    successResponse(res, plans)
  } catch (error) {
    next(error)
  }
}

/** Catálogo declarativo de límites y features para construir el formulario. */
export const getPlanCatalogController = async (_req, res, next) => {
  try {
    successResponse(res, { limits: PLAN_LIMITS, features: PLAN_FEATURES, billingPeriods: BILLING_PERIODS })
  } catch (error) {
    next(error)
  }
}

export const getPlanController = async (req, res, next) => {
  try {
    const plan = await getPlan(req.params.id)
    successResponse(res, plan)
  } catch (error) {
    next(error)
  }
}

export const createPlanController = async (req, res, next) => {
  try {
    const plan = await createPlanService(req.body)
    successResponse(res, plan, 201)
  } catch (error) {
    next(error)
  }
}

export const updatePlanController = async (req, res, next) => {
  try {
    const plan = await updatePlanService(req.params.id, req.body)
    successResponse(res, plan)
  } catch (error) {
    next(error)
  }
}

export const deletePlanController = async (req, res, next) => {
  try {
    await deletePlanService(req.params.id)
    successResponse(res, { message: 'Plan eliminado correctamente' })
  } catch (error) {
    next(error)
  }
}
