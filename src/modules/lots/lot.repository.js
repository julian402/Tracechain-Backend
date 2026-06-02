import prisma from '../../config/db.js'

export const createLot = (data) => {
  return prisma.lot.create({ data })
}

export const findAllLots = () => {
  return prisma.lot.findMany({
    include: { createdBy: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

export const findLotById = (id) => {
  return prisma.lot.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      parentLot: true,
      childLots: true,
      movements: { orderBy: { createdAt: 'desc' } }
    }
  })
}

export const findLotByQrCode = (qrCode) => {
  return prisma.lot.findUnique({
    where: { qrCode },
    include: {
      parentLot: true,
      childLots: true,
      movements: { orderBy: { createdAt: 'desc' } }
    }
  })
}

export const updateLotStatus = (id, status) => {
  return prisma.lot.update({ where: { id }, data: { status } })
}