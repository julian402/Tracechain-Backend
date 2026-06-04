import prisma from '../../config/db.js'

export const createAuditLog = (data) => {
  return prisma.auditLog.create({ data })
}

export const findAllAuditLogs = (organizationId) => {
  return prisma.auditLog.findMany({
    where: organizationId ? { organizationId } : {},
    include: {
      user: { select: { id: true, name: true, email: true } },
      lot: { select: { id: true, code: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const findAuditLogsByLot = (lotId, organizationId) => {
  return prisma.auditLog.findMany({
    where: { lotId, ...(organizationId && { organizationId }) },
    include: {
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const findAuditLogsByUser = (userId, organizationId) => {
  return prisma.auditLog.findMany({
    where: { userId, ...(organizationId && { organizationId }) },
    include: {
      lot: { select: { id: true, code: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const findAuditLogs = ({ page = 1, limit = 15, action, userId, lotId, fromDate, toDate, organizationId } = {}) => {
  const skip = (page - 1) * limit
  const where = {
    ...(organizationId && { organizationId }),
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

export const findAuditLogsByFilters = ({ action, userId, lotId, fromDate, toDate, organizationId }) => {
  return prisma.auditLog.findMany({
    where: {
      ...(organizationId && { organizationId }),
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
