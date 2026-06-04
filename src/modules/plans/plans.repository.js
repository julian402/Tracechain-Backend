import prisma from '../../config/db.js'

export const findAllPlans = () => {
  return prisma.plan.findMany({
    orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
  })
}

export const findActivePlans = () => {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
  })
}

export const findPlanById = (id) => {
  return prisma.plan.findUnique({ where: { id } })
}

export const findPlanByKey = (key) => {
  return prisma.plan.findUnique({ where: { key } })
}

export const countOrganizationsByPlan = (planId) => {
  return prisma.organization.count({ where: { planId } })
}

export const createPlan = (data) => {
  return prisma.plan.create({ data })
}

export const updatePlan = (id, data) => {
  return prisma.plan.update({ where: { id }, data })
}

export const deletePlan = (id) => {
  return prisma.plan.delete({ where: { id } })
}
