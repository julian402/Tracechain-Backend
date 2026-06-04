import {
  getRoles,
  getRole,
  createRoleService,
  updateRoleService,
  setPermissionsService,
  deleteRoleService
} from './roles.service.js'
import { successResponse } from '../../shared/response.helper.js'

export const getRolesController = async (req, res, next) => {
  try {
    // Super admin puede pedir roles de cualquier org vía ?organizationId=
    const orgId = req.user.isSuperAdmin && req.query.organizationId
      ? req.query.organizationId
      : req.organizationId
    const roles = await getRoles(orgId)
    successResponse(res, roles)
  } catch (error) {
    next(error)
  }
}

export const getRoleController = async (req, res, next) => {
  try {
    const role = await getRole(req.params.id, req.organizationId)
    successResponse(res, role)
  } catch (error) {
    next(error)
  }
}

export const createRoleController = async (req, res, next) => {
  try {
    const role = await createRoleService(req.body, req.organizationId)
    successResponse(res, role, 201)
  } catch (error) {
    next(error)
  }
}

export const updateRoleController = async (req, res, next) => {
  try {
    const role = await updateRoleService(req.params.id, req.body, req.organizationId)
    successResponse(res, role)
  } catch (error) {
    next(error)
  }
}

export const setRolePermissionsController = async (req, res, next) => {
  try {
    const role = await setPermissionsService(req.params.id, req.body.permissions, req.organizationId)
    successResponse(res, role)
  } catch (error) {
    next(error)
  }
}

export const deleteRoleController = async (req, res, next) => {
  try {
    const result = await deleteRoleService(req.params.id, req.organizationId)
    successResponse(res, result)
  } catch (error) {
    next(error)
  }
}
