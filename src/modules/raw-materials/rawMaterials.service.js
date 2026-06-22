import {
  findAllRawMaterials,
  findRawMaterialById,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial
} from './rawMaterials.repository.js'
import { findSupplierById } from '../suppliers/suppliers.repository.js'
import { AppError } from '../../shared/AppError.js'

export const getAllRawMaterials = (organizationId) => findAllRawMaterials(organizationId)

export const getRawMaterialById = async (id, organizationId) => {
  const item = await findRawMaterialById(id, organizationId)
  if (!item) throw new AppError('Materia prima no encontrada', 404)
  return item
}

const assertSupplier = async (supplierId, organizationId) => {
  if (!supplierId) return
  const supplier = await findSupplierById(supplierId, organizationId)
  if (!supplier) throw new AppError('Proveedor no encontrado', 404)
}

export const createRawMaterialService = async (data, { userId, organizationId }) => {
  await assertSupplier(data.supplierId, organizationId)
  return createRawMaterial({ ...data, organizationId, createdById: userId })
}

export const updateRawMaterialService = async (id, data, { organizationId }) => {
  const item = await findRawMaterialById(id, organizationId)
  if (!item) throw new AppError('Materia prima no encontrada', 404)
  await assertSupplier(data.supplierId, organizationId)
  return updateRawMaterial(id, data)
}

export const deleteRawMaterialService = async (id, { organizationId }) => {
  const item = await findRawMaterialById(id, organizationId)
  if (!item) throw new AppError('Materia prima no encontrada', 404)
  return deleteRawMaterial(id)
}
