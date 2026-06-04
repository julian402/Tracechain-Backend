import { createMovement, findMovementsByLot, findAllMovements, findMovements } from './movement.repository.js'
import { findLotById } from '../lots/lot.repository.js'
import { AppError } from '../../shared/AppError.js'

export const registerMovement = async (data, userId) => {
  const lot = await findLotById(data.lotId)
  if (!lot) throw new AppError('Lote no encontrado', 404)

  return createMovement({ ...data, createdById: userId })
}

export const getMovementsByLot = async (lotId) => {
  const lot = await findLotById(lotId)
  if (!lot) throw new AppError('Lote no encontrado', 404)

  return findMovementsByLot(lotId)
}

export const getAllMovements = () => findAllMovements()

export const getPaginatedMovements = async ({ page = 1, limit = 10, type, lotCode, fromDate, toDate } = {}) => {
  const p = Number(page); const l = Number(limit)
  const [data, total] = await findMovements({ page: p, limit: l, type, lotCode, fromDate, toDate })
  return { data, total, page: p, totalPages: Math.ceil(total / l) }
}