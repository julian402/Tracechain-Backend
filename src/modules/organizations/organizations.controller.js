import {
  createOrganizationService,
  getOrganizations,
  getOrganizationDetail,
  getMyOrganization,
  changeOrganizationPlan,
  changeOrganizationStatus,
} from './organizations.service.js'
import { successResponse } from '../../shared/response.helper.js'

export const createOrganizationController = async (req, res, next) => {
  try {
    const org = await createOrganizationService(req.body)
    successResponse(res, org, 201)
  } catch (error) {
    next(error)
  }
}

export const getOrganizationsController = async (req, res, next) => {
  try {
    const orgs = await getOrganizations()
    successResponse(res, orgs)
  } catch (error) {
    next(error)
  }
}

export const getMyOrganizationController = async (req, res, next) => {
  try {
    const org = await getMyOrganization(req.user.organizationId)
    successResponse(res, org)
  } catch (error) {
    next(error)
  }
}

export const getOrganizationController = async (req, res, next) => {
  try {
    const org = await getOrganizationDetail(req.params.id)
    successResponse(res, org)
  } catch (error) {
    next(error)
  }
}

export const changeOrganizationPlanController = async (req, res, next) => {
  try {
    const org = await changeOrganizationPlan(req.params.id, req.body.planId)
    successResponse(res, org)
  } catch (error) {
    next(error)
  }
}

export const changeOrganizationStatusController = async (req, res, next) => {
  try {
    const org = await changeOrganizationStatus(req.params.id, req.body.status)
    successResponse(res, org)
  } catch (error) {
    next(error)
  }
}
