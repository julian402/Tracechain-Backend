import { registerMovement, getMovementsByLot, getAllMovements, getPaginatedMovements } from './movement.service.js'
import { successResponse } from '../../shared/response.helper.js'

export const createMovementController = async (req, res, next) => {
  try {
    const movement = await registerMovement(req.body, req.user.id)
    successResponse(res, movement, 201)
  } catch (error) {
    next(error)
  }
}

export const getMovementsByLotController = async (req, res, next) => {
  try {
    const movements = await getMovementsByLot(req.params.lotId)
    successResponse(res, movements)
  } catch (error) {
    next(error)
  }
}

export const getAllMovementsController = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, lotCode, fromDate, toDate } = req.query
    const result = await getPaginatedMovements({ page, limit, type, lotCode, fromDate, toDate })
    successResponse(res, result)
  } catch (error) {
    next(error)
  }
}