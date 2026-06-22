import prisma from '../../config/db.js'

const visitInclude = {
  findings: true,
  createdBy: { select: { id: true, name: true, email: true } },
  responsible: { select: { id: true, name: true, email: true } },
  lot: { select: { id: true, code: true, name: true } }
}

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
    include: visitInclude
  })
}

export const findAllVisits = ({ organizationId, status, responsibleId } = {}) => {
  return prisma.visit.findMany({
    where: {
      ...(organizationId && { organizationId }),
      ...(status && { status }),
      ...(responsibleId && { responsibleId })
    },
    include: visitInclude,
    orderBy: { createdAt: 'desc' }
  })
}

export const findVisitById = (id, organizationId) => {
  return prisma.visit.findFirst({
    where: { id, ...(organizationId && { organizationId }) },
    include: visitInclude
  })
}

export const findVisitsByLot = (lotId, organizationId) => {
  return prisma.visit.findMany({
    where: { lotId, ...(organizationId && { organizationId }) },
    include: {
      findings: true,
      createdBy: { select: { id: true, name: true, email: true } },
      responsible: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const updateVisitStatus = (id, status) => {
  return prisma.visit.update({
    where: { id },
    data: { status },
    include: visitInclude
  })
}
