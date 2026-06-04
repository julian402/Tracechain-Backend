import prisma from '../../config/db.js'

export const createAuditLog = (data) => {
  return prisma.auditLog.create({ data })
}

export const findAllAuditLogs = () => {
  return prisma.auditLog.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      lot: { select: { id: true, code: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const findAuditLogsByLot = (lotId) => {
  return prisma.auditLog.findMany({
    where: { lotId },
    include: {
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const findAuditLogsByUser = (userId) => {
  return prisma.auditLog.findMany({
    where: { userId },
    include: {
      lot: { select: { id: true, code: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const findAuditLogs = ({ page = 1, limit = 15, action, userId, lotId, fromDate, toDate } = {}) => {
  const skip = (page - 1) * limit
  const where = {
    ...(action && { action }),
    ...(userId && { userId }),
    ...(lotId && { lotId }),
    ...((fromDate || toDate) && {
      createdAt: {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && { lte: new Date(toDate) })
      }
    })
  }
  return prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        lot: { select: { id: true, code: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.auditLog.count({ where })
  ])
}

export const findAuditLogsByFilters = ({ action, userId, lotId, fromDate, toDate }) => {
  return prisma.auditLog.findMany({
    where: {
      ...(action && { action }),
      ...(userId && { userId }),
      ...(lotId && { lotId }),
      ...(fromDate && toDate && {
        createdAt: {
          gte: new Date(fromDate),
          lte: new Date(toDate)
        }
      })
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      lot: { select: { id: true, code: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}