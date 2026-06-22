import { findAllSuppliers, findSupplierById, createSupplier, updateSupplier, deleteSupplier } from './suppliers.repository.js'
import { AppError } from '../../shared/AppError.js'

export const getAllSuppliers = (organizationId) => findAllSuppliers(organizationId)

export const getSupplierById = async (id, organizationId) => {
  const supplier = await findSupplierById(id, organizationId)
  if (!supplier) throw new AppError('Proveedor no encontrado', 404)
  return supplier
}

export const createSupplierService = (data, { organizationId }) => {
  return createSupplier({ ...data, organizationId })
}

export const updateSupplierService = async (id, data, { organizationId }) => {
  const supplier = await findSupplierById(id, organizationId)
  if (!supplier) throw new AppError('Proveedor no encontrado', 404)
  return updateSupplier(id, data)
}

export const deleteSupplierService = async (id, { organizationId }) => {
  const supplier = await findSupplierById(id, organizationId)
  if (!supplier) throw new AppError('Proveedor no encontrado', 404)
  return deleteSupplier(id)
}
