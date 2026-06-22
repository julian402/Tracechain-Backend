import {
  getAllSuppliers,
  getSupplierById,
  createSupplierService,
  updateSupplierService,
  deleteSupplierService
} from './suppliers.service.js'
import { successResponse } from '../../shared/response.helper.js'

export const getAllSuppliersController = async (req, res, next) => {
  try {
    const suppliers = await getAllSuppliers(req.organizationId)
    successResponse(res, suppliers)
  } catch (error) {
    next(error)
  }
}

export const getSupplierByIdController = async (req, res, next) => {
  try {
    const supplier = await getSupplierById(req.params.id, req.organizationId)
    successResponse(res, supplier)
  } catch (error) {
    next(error)
  }
}

export const createSupplierController = async (req, res, next) => {
  try {
    const supplier = await createSupplierService(req.body, { organizationId: req.organizationId })
    successResponse(res, supplier, 201)
  } catch (error) {
    next(error)
  }
}

export const updateSupplierController = async (req, res, next) => {
  try {
    const supplier = await updateSupplierService(req.params.id, req.body, { organizationId: req.organizationId })
    successResponse(res, supplier)
  } catch (error) {
    next(error)
  }
}

export const deleteSupplierController = async (req, res, next) => {
  try {
    await deleteSupplierService(req.params.id, { organizationId: req.organizationId })
    successResponse(res, { deleted: true })
  } catch (error) {
    next(error)
  }
}
