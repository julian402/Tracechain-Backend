import {
  createLotService,
  getAllLots,
  getLotById,
  getPublicLotByQr,
  changeLotStatus,
  getLotsByFilters
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
    const lots = await getAllLots()
    successResponse(res, lots)
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

export const getLotTreeController = async (req, res, next) => {
  try {
    const tree = await getLotTree(req.params.id)
    successResponse(res, tree)
  } catch (error) {
    next(error)
  }
}