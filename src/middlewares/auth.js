import jwt from 'jsonwebtoken'
import prisma from '../config/db.js'
import { AppError } from '../shared/AppError.js'
import { findUserAccessContext } from '../shared/access.js'
import { getPlanLimit, planHasFeature } from '../shared/plans.js'

/**
 * Verifica el JWT y carga el contexto de acceso completo en `req.user`:
 * { id, name, email, isSuperAdmin, organizationId, roleId, roleName,
 *   permissionKeys[], organization, plan }.
 * También deja `req.organizationId` con la organización del usuario.
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No autorizado', 401))
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await findUserAccessContext(decoded.id)
    if (!user) return next(new AppError('No autorizado', 401))
    if (user.organization && user.organization.status === 'SUSPENDED') {
      return next(new AppError('Tu organización está suspendida', 403))
    }
    req.user = user
    req.organizationId = user.organizationId
    next()
  } catch (err) {
    if (err instanceof AppError) return next(err)
    next(new AppError('Token inválido o expirado', 401))
  }
}

/**
 * Exige al menos uno de los permisos indicados (`module:action`).
 * El super admin siempre pasa (bypass).
 */
export const requirePermission = (...keys) => (req, res, next) => {
  if (req.user?.isSuperAdmin) return next()
  const has = keys.some((k) => req.user?.permissionKeys?.includes(k))
  if (!has) return next(new AppError('No tienes permisos para esta acción', 403))
  next()
}

/** Solo super admin (área de plataforma). */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user?.isSuperAdmin) return next(new AppError('Acceso restringido a la plataforma', 403))
  next()
}

/**
 * Permite al super admin inspeccionar una organización concreta vía
 * `?organizationId=`. Para usuarios normales fija su propia organización.
 */
export const tenantScope = (req, res, next) => {
  if (req.user?.isSuperAdmin) {
    req.organizationId = req.query.organizationId || req.user.organizationId || null
  } else {
    req.organizationId = req.user.organizationId
  }
  next()
}

/** Bloquea features no incluidas en el plan de la organización. */
export const requireFeature = (featureKey) => (req, res, next) => {
  if (req.user?.isSuperAdmin) return next()
  if (!planHasFeature(req.user?.plan, featureKey)) {
    return next(new AppError('Esta función requiere mejorar tu plan', 403))
  }
  next()
}

/** Hace cumplir el límite de lotes del plan antes de crear uno nuevo. */
export const enforceLotLimit = async (req, res, next) => {
  try {
    if (req.user?.isSuperAdmin) return next()
    const max = getPlanLimit(req.user?.plan, 'lots')
    if (max == null) return next()
    const count = await prisma.lot.count({ where: { organizationId: req.organizationId } })
    if (count >= max) {
      return next(new AppError(`Límite del plan alcanzado (${max} lotes). Mejora tu plan para crear más.`, 403))
    }
    next()
  } catch (err) {
    next(err)
  }
}
