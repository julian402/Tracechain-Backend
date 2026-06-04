import prisma from '../../config/db.js'
import { successResponse } from '../../shared/response.helper.js'

// Devuelve el catálogo de permisos agrupado por módulo para pintar la matriz.
export const getPermissionsController = async (_req, res, next) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }]
    })

    const byModule = {}
    for (const p of permissions) {
      if (!byModule[p.module]) byModule[p.module] = []
      byModule[p.module].push({ key: p.key, action: p.action, label: p.label })
    }
    const grouped = Object.entries(byModule).map(([module, items]) => ({ module, permissions: items }))

    successResponse(res, { permissions, grouped })
  } catch (error) {
    next(error)
  }
}
