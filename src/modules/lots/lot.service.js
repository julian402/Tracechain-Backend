import { v4 as uuidv4 } from 'uuid'
import { createLot, findAllLots, findLots, findLotById, findLotByQrCode, updateLotStatus, updateLot, findLotsByFilters, findLotAncestors, findLotDescendants } from './lot.repository.js'
import prisma from '../../config/db.js'
import { AppError } from '../../shared/AppError.js'
import { logAction } from '../../shared/audit.helper.js'


const generateCode = () => `LOT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

export const createLotService = async (data, { userId, organizationId }) => {
  const code = generateCode()
  const qrCode = uuidv4()

  if (data.parentLotId) {
    const parent = await findLotById(data.parentLotId, organizationId)
    if (!parent) throw new AppError('Lote padre no encontrado', 404)
  }

  // El proveedor (si se indica) debe pertenecer a la organización.
  if (data.supplierId) {
    const supplier = await prisma.supplier.findFirst({ where: { id: data.supplierId, organizationId } })
    if (!supplier) throw new AppError('Proveedor no encontrado', 404)
  }

  // Cada materia prima usada debe existir dentro de la organización.
  if (data.ingredients?.length) {
    const ids = [...new Set(data.ingredients.map((i) => i.rawMaterialBatchId))]
    const count = await prisma.rawMaterialBatch.count({ where: { id: { in: ids }, organizationId } })
    if (count !== ids.length) throw new AppError('Una o más materias primas no son válidas', 404)
  }

  const created = await createLot({ ...data, code, qrCode, organizationId, createdById: userId })
  // Relee con sus relaciones (proveedor, ingredientes) para devolver el detalle completo.
  const lot = await findLotById(created.id, organizationId)

  await logAction({
    action: 'CREATE',
    entity: 'Lot',
    entityId: lot.id,
    userId,
    organizationId,
    lotId: lot.id,
    newData: lot
  })

  return lot
}

export const getAllLots = (organizationId) => findAllLots(organizationId)

export const getPaginatedLots = async ({ page = 1, limit = 10, search, status, organizationId } = {}) => {
  const p = Number(page); const l = Number(limit)
  const [data, total] = await findLots({ page: p, limit: l, search, status, organizationId })
  return { data, total, page: p, totalPages: Math.ceil(total / l) }
}

export const getLotById = async (id, organizationId) => {
  const lot = await findLotById(id, organizationId)
  if (!lot) throw new AppError('Lote no encontrado', 404)
  return lot
}

export const getPublicLotByQr = async (qrCode) => {
  const lot = await findLotByQrCode(qrCode)
  if (!lot) throw new AppError('Lote no encontrado', 404)
  return lot
}

export const changeLotStatus = async (id, status, organizationId) => {
  const lot = await findLotById(id, organizationId)
  if (!lot) throw new AppError('Lote no encontrado', 404)
  return updateLotStatus(id, status)
}

export const getLotsByFilters = (filters) => findLotsByFilters(filters)

export const updateLotService = async (id, data, { userId, organizationId }) => {
  const lot = await findLotById(id, organizationId)
  if (!lot) throw new AppError('Lote no encontrado', 404)

  const updated = await updateLot(id, data)

  await logAction({
    action: 'UPDATE',
    entity: 'Lot',
    entityId: id,
    userId,
    organizationId,
    lotId: id,
    oldData: lot,
    newData: updated
  })

  return updated
}


export const getLotTree = async (id, organizationId) => {
  const lot = await findLotById(id, organizationId)
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
