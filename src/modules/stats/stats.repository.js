import prisma from '../../config/db.js'

export const getDashboardStats = async () => {
  const now = new Date()
  const in7Days = new Date()
  in7Days.setDate(now.getDate() + 7)

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const [
    totalLots,
    activeLots,
    expiredLots,
    quarantineLots,
    expiringLots,
    totalMovements,
    recentLots,
    lotsForChart,
    activeAlerts
  ] = await Promise.all([
    prisma.lot.count(),
    prisma.lot.count({ where: { status: 'ACTIVE' } }),
    prisma.lot.count({ where: { status: 'EXPIRED' } }),
    prisma.lot.count({ where: { status: 'QUARANTINE' } }),
    prisma.lot.count({
      where: {
        status: 'ACTIVE',
        expirationDate: { gte: now, lte: in7Days }
      }
    }),
    prisma.movement.count(),
    prisma.lot.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true } }
      }
    }),
    prisma.lot.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    }),
    prisma.lot.findMany({
      where: {
        OR: [
          { status: 'EXPIRED' },
          { status: 'QUARANTINE' },
          {
            status: 'ACTIVE',
            expirationDate: { gte: now, lte: in7Days }
          }
        ]
      },
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        expirationDate: true,
        quantity: true,
        unit: true
      },
      orderBy: { expirationDate: 'asc' }
    })
  ])

  const monthMap = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = d.toISOString().slice(0, 7)
    monthMap[key] = 0
  }
  lotsForChart.forEach(l => {
    const key = l.createdAt.toISOString().slice(0, 7)
    if (key in monthMap) monthMap[key]++
  })
  const lotsByMonth = Object.entries(monthMap).map(([mes, lotes]) => ({ mes, lotes }))

  return {
    kpis: {
      totalLots,
      activeLots,
      expiredLots,
      quarantineLots,
      expiringIn7Days: expiringLots,
      totalMovements
    },
    recentLots,
    activeAlerts,
    lotsByMonth
  }
}