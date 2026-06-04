import { AppError } from '../../shared/AppError.js'
import {
  findAllPlans,
  findActivePlans,
  findPlanById,
  findPlanByKey,
  countOrganizationsByPlan,
  createPlan,
  updatePlan,
  deletePlan,
} from './plans.repository.js'

export const listPlans = ({ activeOnly = false } = {}) =>
  activeOnly ? findActivePlans() : findAllPlans()

export const getPlan = async (id) => {
  const plan = await findPlanById(id)
  if (!plan) throw new AppError('Plan no encontrado', 404)
  return plan
}

export const createPlanService = async (data) => {
  const exists = await findPlanByKey(data.key)
  if (exists) throw new AppError('Ya existe un plan con esa clave', 400)
  return createPlan(data)
}

export const updatePlanService = async (id, data) => {
  const plan = await findPlanById(id)
  if (!plan) throw new AppError('Plan no encontrado', 404)
  // La clave es inmutable: otras partes (registro, seed) la usan como identificador estable.
  const { key: _ignored, ...updatable } = data
  return updatePlan(id, updatable)
}

export const deletePlanService = async (id) => {
  const plan = await findPlanById(id)
  if (!plan) throw new AppError('Plan no encontrado', 404)

  const inUse = await countOrganizationsByPlan(id)
  if (inUse > 0) {
    throw new AppError(`No se puede eliminar: ${inUse} organización(es) usan este plan`, 409)
  }
  return deletePlan(id)
}
