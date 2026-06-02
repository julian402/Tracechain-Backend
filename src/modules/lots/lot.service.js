import { v4 as uuidv4 } from 'uuid'
import { createLot, findAllLots, findLotById, findLotByQrCode, updateLotStatus } from './lot.repository.js'
import { AppError } from '../../shared/AppError.js'
import { logAction } from '../../shared/audit.helper.js'
import { findLotsByFilters } from './lot.repository.js'
import { findLotAncestors, findLotDescendants } from './lot.repository.js'


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