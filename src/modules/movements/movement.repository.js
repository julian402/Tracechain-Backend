import prisma from '../../config/db.js'

export const createMovement = (data) => {
  return prisma.movement.create({
    data,
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      lot: { select: { id: true, code: true, name: true } }
    }
  })
}

export const findMovementsByLot = (lotId, organizationId) => {
  return prisma.movement.findMany({
    where: { lotId, ...(organizationId && { organizationId }) },
    include: {
      createdBy: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const findAllMovements = (organizationId) => {
  return prisma.movement.findMany({
    where: organizationId ? { organizationId } : {},
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      lot: { select: { id: true, code: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const findMovements = ({ page = 1, limit = 10, type, lotCode, fromDate, toDate, organizationId } = {}) => {
  const skip = (page - 1) * limit
  const where = {
    ...(organizationId && { organizationId }),
    ...(type && { type }),
    ...(lotCode && { lot: { code: { contains: lotCode, mode: 'insensitive' } } }),
    ...((fromDate || toDate) && {
      createdAt: {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && { lte: new Date(toDate + 'T23:59:59') })
      }
    })
  }
  return prisma.$transaction([
    prisma.movement.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        lot: { select: { id: true, code: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.movement.count({ where })
  ])
}
