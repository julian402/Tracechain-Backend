import { v4 as uuidv4 } from 'uuid'
import { createLot, findAllLots, findLots, findLotById, findLotByQrCode, updateLotStatus, updateLot, findLotsByFilters, findLotAncestors, findLotDescendants } from './lot.repository.js'
import { AppError } from '../../shared/AppError.js'
import { logAction } from '../../shared/audit.helper.js'


const generateCode = () => `LOT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

export const createLotService = async (data, userId) => {
  const code = generateCode()
  const qrCode = uuidv4()

  if (data.parentLotId) {
    const parent = await findLotById(data.parentLotId)
    if (!parent) throw new AppError('Lote padre no encontrado', 404)
  }

  const lot = await createLot({ ...data, code, qrCode, createdById: userId })

  await logAction({
    action: 'CREATE',
    entity: 'Lot',
    entityId: lot.id,
    userId,
    lotId: lot.id,
    newData: lot
  })

  return lot
}

export const getAllLots = () => findAllLots()

export const getPaginatedLots = async ({ page = 1, limit = 10, search, status } = {}) => {
  const p = Number(page); const l = Number(limit)
  const [data, total] = await findLots({ page: p, limit: l, search, status })
  return { data, total, page: p, totalPages: Math.ceil(total / l) }
}

export const getLotById = async (id) => {
  const lot = await findLotById(id)
  if (!lot) throw new AppError('Lote no encontrado', 404)
  return lot
}

export const getPublicLotByQr = async (qrCode) => {
  const lot = await findLotByQrCode(qrCode)
  if (!lot) throw new AppError('Lote no encontrado', 404)
  return lot
}

export const changeLotStatus = async (id, status) => {
  const lot = await findLotById(id)
  if (!lot) throw new AppError('Lote no encontrado', 404)
  return updateLotStatus(id, status)
}

export const getLotsByFilters = (filters) => findLotsByFilters(filters)

export const updateLotService = async (id, data, userId) => {
  const lot = await findLotById(id)
  if (!lot) throw new AppError('Lote no encontrado', 404)

  const updated = await updateLot(id, data)

  await logAction({
    action: 'UPDATE',
    entity: 'Lot',
    entityId: id,
    userId,
    lotId: id,
    oldData: lot,
    newData: updated
  })

  return updated
}


export const getLotTree = async (id) => {
  const lot = await findLotById(id)
  if (!lot) throw new AppError('Lote no encontrado', 404)

  const [ancestors, descendants] = await Promise.all([
    findLotAncestors(id),
    findLotDescendants(id)
  ])

  return {
    current: lot,
    ancestors,
    descendants
  }
}