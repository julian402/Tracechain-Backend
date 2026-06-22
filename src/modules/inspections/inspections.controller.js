import { createVisit, getAllVisits, getVisitById, getVisitsByLot, changeVisitStatus } from './inspections.service.js'
import { successResponse } from '../../shared/response.helper.js'

export const createVisitController = async (req, res, next) => {
  try {
    const visit = await createVisit(req.body, { userId: req.user.id, organizationId: req.organizationId })
    successResponse(res, visit, 201)
  } catch (error) {
    next(error)
  }
}

export const getAllVisitsController = async (req, res, next) => {
  try {
    const { status, mine } = req.query
    const responsibleId = mine === 'true' ? req.user.id : undefined
    const visits = await getAllVisits({ organizationId: req.organizationId, status, responsibleId })
    successResponse(res, visits)
  } catch (error) {
    next(error)
  }
}

export const getVisitByIdController = async (req, res, next) => {
  try {
    const visit = await getVisitById(req.params.id, req.organizationId)
    successResponse(res, visit)
  } catch (error) {
    next(error)
  }
}

export const getVisitsByLotController = async (req, res, next) => {
  try {
    const visits = await getVisitsByLot(req.params.lotId, req.organizationId)
    successResponse(res, visits)
  } catch (error) {
    next(error)
  }
}

export const updateVisitStatusController = async (req, res, next) => {
  try {
    const visit = await changeVisitStatus(req.params.id, req.body.status, { userId: req.user.id, organizationId: req.organizationId })
    successResponse(res, visit)
  } catch (error) {
    next(error)
  }
}
