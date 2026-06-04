import {
  findAllAuditLogs,
  findAuditLogs,
  findAuditLogsByLot,
  findAuditLogsByUser,
  findAuditLogsByFilters
} from './audit.repository.js'
import { successResponse } from '../../shared/response.helper.js'

export const getAllAuditLogsController = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, action, userId, lotId, fromDate, toDate } = req.query
    const p = Number(page); const l = Number(limit)
    const [data, total] = await findAuditLogs({ page: p, limit: l, action, userId, lotId, fromDate, toDate, organizationId: req.organizationId })
    successResponse(res, { data, total, page: p, totalPages: Math.ceil(total / l) })
  } catch (error) {
    next(error)
  }
}

export const getAuditLogsByLotController = async (req, res, next) => {
  try {
    const logs = await findAuditLogsByLot(req.params.lotId, req.organizationId)
    successResponse(res, logs)
  } catch (error) {
    next(error)
  }
}

export const getAuditLogsByUserController = async (req, res, next) => {
  try {
    const logs = await findAuditLogsByUser(req.params.userId, req.organizationId)
    successResponse(res, logs)
  } catch (error) {
    next(error)
  }
}

export const getAuditLogsByFiltersController = async (req, res, next) => {
  try {
    const { action, userId, lotId, fromDate, toDate } = req.query
    const logs = await findAuditLogsByFilters({ action, userId, lotId, fromDate, toDate, organizationId: req.organizationId })
    successResponse(res, logs)
  } catch (error) {
    next(error)
  }
}
