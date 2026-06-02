import { v4 as uuidv4 } from 'uuid'
import { createLot, findAllLots, findLotById, findLotByQrCode, updateLotStatus } from './lot.repository.js'
import { AppError } from '../../shared/AppError.js'

const generateCode = () => `LOT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

export const createLotService = async (data, userId) => {
  const code = generateCode()
  const qrCode = uuidv4()

  if (data.parentLotId) {
    const parent = await findLotById(data.parentLotId)
    if (!parent) throw new AppError('Lote padre no encontrado', 404)
  }

  return createLot({ ...data, code, qrCode, createdById: userId })
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