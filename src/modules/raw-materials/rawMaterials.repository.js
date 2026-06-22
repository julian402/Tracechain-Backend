import prisma from '../../config/db.js'

const include = {
  supplier: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true, email: true } }
}

export const findAllRawMaterials = (organizationId) => {
  return prisma.rawMaterialBatch.findMany({
    where: organizationId ? { organizationId } : {},
    include,
    orderBy: { createdAt: 'desc' }
  })
}

export const findRawMaterialById = (id, organizationId) => {
  return prisma.rawMaterialBatch.findFirst({
    where: { id, ...(organizationId && { organizationId }) },
    include: {
      ...include,
      usedIn: {
        include: { lot: { select: { id: true, code: true, name: true } } }
      }
    }
  })
}

export const createRawMaterial = (data) => {
  return prisma.rawMaterialBatch.create({ data, include })
}

export const updateRawMaterial = (id, data) => {
  return prisma.rawMaterialBatch.update({ where: { id }, data, include })
}

export const deleteRawMaterial = (id) => {
  return prisma.rawMaterialBatch.delete({ where: { id } })
}
