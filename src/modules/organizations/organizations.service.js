import prisma from '../../config/db.js'
import { AppError } from '../../shared/AppError.js'
import { findPlanById } from '../plans/plans.repository.js'
import { PLAN_LIMITS, PLAN_FEATURES, getPlanLimit, planHasFeature } from '../../shared/plans.js'
import { seedOrganizationRoles } from '../../shared/rbac.js'
import {
  findAllOrganizations,
  findOrganizationById,
  createOrganization,
  countOrgLots,
  countOrgUsers,
  updateOrganization,
} from './organizations.repository.js'

const slugify = (str) =>
  str.toLowerCase().trim().normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const ORG_STATUSES = ['ACTIVE', 'SUSPENDED']

// Salida para el listado de plataforma (super admin).
const toListDTO = (org) => ({
  id: org.id,
  name: org.name,
  slug: org.slug,
  status: org.status,
  createdAt: org.createdAt,
  plan: org.plan ? { id: org.plan.id, key: org.plan.key, name: org.plan.name } : null,
  usersCount: org._count?.users ?? 0,
  lotsCount: org._count?.lots ?? 0,
})

/**
 * Construye el detalle de uso de una organización contra los límites/features
 * de su plan. Sirve tanto a super admin como a "mi organización".
 */
const buildUsage = async (org) => {
  const [lots, users] = await Promise.all([
    countOrgLots(org.id),
    countOrgUsers(org.id),
  ])
  const usageByKey = { lots, users }

  const limits = PLAN_LIMITS.map((l) => {
    const max = getPlanLimit(org.plan, l.key)
    const used = usageByKey[l.key] ?? null
    return {
      key: l.key,
      label: l.label,
      max,                         // null = ilimitado
      used,
      reached: max != null && used != null && used >= max,
    }
  })

  const features = PLAN_FEATURES.map((f) => ({
    key: f.key,
    label: f.label,
    enabled: planHasFeature(org.plan, f.key),
  }))

  return { limits, features }
}

export const createOrganizationService = async ({ name, slug, planId }) => {
  const plan = await findPlanById(planId)
  if (!plan) throw new AppError('Plan no encontrado', 404)

  const base = slug || slugify(name) || 'org'
  let finalSlug = base
  let suffix = 1
  while (await prisma.organization.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${base}-${suffix++}`
  }

  const org = await prisma.$transaction(async (tx) => {
    const created = await tx.organization.create({ data: { name, slug: finalSlug, planId } })
    await seedOrganizationRoles(tx, created.id)
    return created
  })

  return getOrganizationDetail(org.id)
}

export const getOrganizations = async () => {
  const orgs = await findAllOrganizations()
  return orgs.map(toListDTO)
}

export const getOrganizationDetail = async (id) => {
  const org = await findOrganizationById(id)
  if (!org) throw new AppError('Organización no encontrada', 404)
  const usage = await buildUsage(org)
  return { ...org, ...usage }
}

/** Datos de la propia organización del usuario autenticado (cualquier rol). */
export const getMyOrganization = async (organizationId) => {
  if (!organizationId) throw new AppError('No perteneces a ninguna organización', 404)
  return getOrganizationDetail(organizationId)
}

export const changeOrganizationPlan = async (id, planId) => {
  const org = await findOrganizationById(id)
  if (!org) throw new AppError('Organización no encontrada', 404)

  const plan = await findPlanById(planId)
  if (!plan) throw new AppError('Plan no encontrado', 404)

  const updated = await updateOrganization(id, { planId })
  return getOrganizationDetail(updated.id)
}

export const changeOrganizationStatus = async (id, status) => {
  if (!ORG_STATUSES.includes(status)) {
    throw new AppError('Estado inválido', 400)
  }
  const org = await findOrganizationById(id)
  if (!org) throw new AppError('Organización no encontrada', 404)

  const updated = await updateOrganization(id, { status })
  return toListDTO({ ...updated, _count: { users: org._count?.users, lots: org._count?.lots } })
}
