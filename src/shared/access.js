import prisma from '../config/db.js'
import { buildEffectivePlan } from './plans.js'

/**
 * Carga el contexto de acceso de un usuario en cada request: organización,
 * rol, permisos efectivos y plan. Se consulta por request (sin cache) para
 * que cambios de rol/plan apliquen de inmediato; el volumen actual lo permite.
 *
 * Devuelve `null` si el usuario no existe.
 */
export const findUserAccessContext = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      isSuperAdmin: true,
      organizationId: true,
      roleId: true,
      role: {
        select: {
          id: true,
          name: true,
          permissions: { select: { permission: { select: { key: true } } } },
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          customLimits: true,
          customFeatures: true,
          analyticsConfig: true,
          plan: true,
        },
      },
    },
  })

  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isSuperAdmin: user.isSuperAdmin,
    organizationId: user.organizationId,
    roleId: user.roleId,
    roleName: user.role?.name ?? null,
    permissionKeys: (user.role?.permissions ?? []).map((rp) => rp.permission.key),
    organization: user.organization ?? null,
    plan: buildEffectivePlan(user.organization),
  }
}

/**
 * Lista de permisos efectivos para enviar al frontend. El super admin recibe
 * '*' (comodín) ya que su acceso es total por bypass en el backend.
 */
export const effectivePermissions = (ctx) => (ctx.isSuperAdmin ? ['*'] : ctx.permissionKeys)
