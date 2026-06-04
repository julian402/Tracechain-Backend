import prisma from '../../config/db.js'

export const findAllOrganizations = () => {
  return prisma.organization.findMany({
    include: {
      plan: true,
      _count: { select: { users: true, lots: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const findOrganizationById = (id) => {
  return prisma.organization.findUnique({
    where: { id },
    include: { plan: true }
  })
}

export const countOrgLots = (organizationId) => prisma.lot.count({ where: { organizationId } })

export const countOrgUsers = (organizationId) => prisma.user.count({ where: { organizationId } })

export const createOrganization = (data) => {
  return prisma.organization.create({
    data,
    include: { plan: true, _count: { select: { users: true, lots: true } } }
  })
}

export const updateOrganization = (id, data) => {
  return prisma.organization.update({
    where: { id },
    data,
    include: { plan: true }
  })
}
