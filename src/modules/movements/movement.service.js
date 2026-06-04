import { createMovement, findMovementsByLot, findAllMovements, findMovements } from './movement.repository.js'
import { findLotById } from '../lots/lot.repository.js'
import { AppError } from '../../shared/AppError.js'

export const registerMovement = async (data, { userId, organizationId }) => {
  const lot = await findLotById(data.lotId, organizationId)
  if (!lot) throw new AppError('Lote no encontrado', 404)

  return createMovement({ ...data, organizationId, createdById: userId })
}

export const getMovementsByLot = async (lotId, organizationId) => {
  const lot = await findLotById(lotId, organizationId)
  if (!lot) throw new AppError('Lote no encontrado', 404)

  return findMovementsByLot(lotId, organizationId)
}

export const getAllMovements = (organizationId) => findAllMovements(organizationId)

export const getPaginatedMovements = async ({ page = 1, limit = 10, type, lotCode, fromDate, toDate, organizationId } = {}) => {
  const p = Number(page); const l = Number(limit)
  const [data, total] = await findMovements({ page: p, limit: l, type, lotCode, fromDate, toDate, organizationId })
  return { data, total, page: p, totalPages: Math.ceil(total / l) }
}
