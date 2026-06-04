import {
  createLotService,
  getAllLots,
  getPaginatedLots,
  getLotById,
  getPublicLotByQr,
  changeLotStatus,
  getLotsByFilters,
  updateLotService
} from './lot.service.js'
import { successResponse } from '../../shared/response.helper.js'
import { getLotTree } from './lot.service.js'


export const createLotController = async (req, res, next) => {
  try {
    const lot = await createLotService(req.body, req.user.id)
    successResponse(res, lot, 201)
  } catch (error) {
    next(error)
  }
}

export const getAllLotsController = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query
    const result = await getPaginatedLots({ page, limit, search, status })
    successResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getLotByIdController = async (req, res, next) => {
  try {
    const lot = await getLotById(req.params.id)
    successResponse(res, lot)
  } catch (error) {
    next(error)
  }
}

export const getPublicLotController = async (req, res, next) => {
  try {
    const lot = await getPublicLotByQr(req.params.qrCode)
    successResponse(res, lot)
  } catch (error) {
    next(error)
  }
}

export const changeLotStatusController = async (req, res, next) => {
  try {
    const lot = await changeLotStatus(req.params.id, req.body.status)
    successResponse(res, lot)
  } catch (error) {
    next(error)
  }
}

export const getLotsByFiltersController = async (req, res, next) => {
  try {
    const { status, search, fromDate, toDate } = req.query
    const lots = await getLotsByFilters({ status, search, fromDate, toDate })
    successResponse(res, lots)
  } catch (error) {
    next(error)
  }
}

export const updateLotController = async (req, res, next) => {
  try {
    const lot = await updateLotService(req.params.id, req.body, req.user.id)
    successResponse(res, lot)
  } catch (error) {
    next(error)
  }
}

export const getLotTreeController = async (req, res, next) => {
  try {
    const tree = await getLotTree(req.params.id)
    successResponse(res, tree)
  } catch (error) {
    next(error)
  }
}