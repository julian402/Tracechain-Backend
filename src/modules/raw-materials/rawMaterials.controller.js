import {
  getAllRawMaterials,
  getRawMaterialById,
  createRawMaterialService,
  updateRawMaterialService,
  deleteRawMaterialService
} from './rawMaterials.service.js'
import { successResponse } from '../../shared/response.helper.js'

export const getAllRawMaterialsController = async (req, res, next) => {
  try {
    const items = await getAllRawMaterials(req.organizationId)
    successResponse(res, items)
  } catch (error) {
    next(error)
  }
}

export const getRawMaterialByIdController = async (req, res, next) => {
  try {
    const item = await getRawMaterialById(req.params.id, req.organizationId)
    successResponse(res, item)
  } catch (error) {
    next(error)
  }
}

export const createRawMaterialController = async (req, res, next) => {
  try {
    const item = await createRawMaterialService(req.body, { userId: req.user.id, organizationId: req.organizationId })
    successResponse(res, item, 201)
  } catch (error) {
    next(error)
  }
}

export const updateRawMaterialController = async (req, res, next) => {
  try {
    const item = await updateRawMaterialService(req.params.id, req.body, { organizationId: req.organizationId })
    successResponse(res, item)
  } catch (error) {
    next(error)
  }
}

export const deleteRawMaterialController = async (req, res, next) => {
  try {
    await deleteRawMaterialService(req.params.id, { organizationId: req.organizationId })
    successResponse(res, { deleted: true })
  } catch (error) {
    next(error)
  }
}
