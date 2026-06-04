import prisma from '../../config/db.js'

export const createVisitWithFindings = (visitData, findings, userId, organizationId) => {
  return prisma.visit.create({
    data: {
      ...visitData,
      organizationId,
      createdById: userId,
      findings: {
        create: findings
      }
    },
    include: {
      findings: true,
      createdBy: { select: { id: true, name: true, email: true } },
      lot: { select: { id: true, code: true, name: true } }
    }
  })
}

export const findAllVisits = (organizationId) => {
  return prisma.visit.findMany({
    where: organizationId ? { organizationId } : {},
    include: {
      findings: true,
      createdBy: { select: { id: true, name: true, email: true } },
      lot: { select: { id: true, code: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const findVisitById = (id, organizationId) => {
  return prisma.visit.findFirst({
    where: { id, ...(organizationId && { organizationId }) },
    include: {
      findings: true,
      createdBy: { select: { id: true, name: true, email: true } },
      lot: { select: { id: true, code: true, name: true } }
    }
  })
}

export const findVisitsByLot = (lotId, organizationId) => {
  return prisma.visit.findMany({
    where: { lotId, ...(organizationId && { organizationId }) },
    include: {
      findings: true,
      createdBy: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}
