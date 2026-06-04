import prisma from '../../config/db.js'

export const createLot = (data) => {
  return prisma.lot.create({ data })
}

export const findAllLots = (organizationId) => {
  return prisma.lot.findMany({
    where: organizationId ? { organizationId } : {},
    include: { createdBy: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

export const findLotById = (id, organizationId) => {
  return prisma.lot.findFirst({
    where: { id, ...(organizationId && { organizationId }) },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      parentLot: true,
      childLots: true,
      movements: { orderBy: { createdAt: 'desc' } }
    }
  })
}

// Público (QR): NO se filtra por organización a propósito.
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

export const updateLot = (id, data) => {
  return prisma.lot.update({
    where: { id },
    data,
    include: { createdBy: { select: { id: true, name: true, email: true } } }
  })
}

export const findLots = ({ page = 1, limit = 10, search, status, organizationId } = {}) => {
  const skip = (page - 1) * limit
  const where = {
    ...(organizationId && { organizationId }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { sanitaryRecord: { contains: search, mode: 'insensitive' } }
      ]
    })
  }
  return prisma.$transaction([
    prisma.lot.findMany({
      where,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.lot.count({ where })
  ])
}

export const findLotsByFilters = ({ status, search, fromDate, toDate, organizationId }) => {
  return prisma.lot.findMany({
    where: {
      ...(organizationId && { organizationId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { sanitaryRecord: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(fromDate && toDate && {
        createdAt: {
          gte: new Date(fromDate),
          lte: new Date(toDate)
        }
      })
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const findLotAncestors = async (lotId) => {
  const ancestors = []
  let currentId = lotId

  while (currentId) {
    const lot = await prisma.lot.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        quantity: true,
        unit: true,
        productionDate: true,
        expirationDate: true,
        parentLotId: true
      }
    })
    if (!lot || !lot.parentLotId) break
    ancestors.push(lot)
    currentId = lot.parentLotId
  }

  return ancestors
}

export const findLotDescendants = async (lotId) => {
  const descendants = []

  const getChildren = async (id) => {
    const children = await prisma.lot.findMany({
      where: { parentLotId: id },
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        quantity: true,
        unit: true,
        productionDate: true,
        expirationDate: true,
        parentLotId: true
      }
    })

    for (const child of children) {
      descendants.push(child)
      await getChildren(child.id)
    }
  }

  await getChildren(lotId)
  return descendants
}
