import prisma from '../../config/db.js'

export const findAllSuppliers = (organizationId) => {
  return prisma.supplier.findMany({
    where: organizationId ? { organizationId } : {},
    orderBy: { name: 'asc' }
  })
}

export const findSupplierById = (id, organizationId) => {
  return prisma.supplier.findFirst({
    where: { id, ...(organizationId && { organizationId }) }
  })
}

export const createSupplier = (data) => {
  return prisma.supplier.create({ data })
}

export const updateSupplier = (id, data) => {
  return prisma.supplier.update({ where: { id }, data })
}

export const deleteSupplier = (id) => {
  return prisma.supplier.delete({ where: { id } })
}
