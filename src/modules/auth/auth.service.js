import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../config/db.js'
import { AppError } from '../../shared/AppError.js'
import { findUserByEmail } from './auth.repository.js'
import { findUserAccessContext, effectivePermissions } from '../../shared/access.js'
import { seedOrganizationRoles, OWNER_ROLE_NAME } from '../../shared/rbac.js'

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const buildToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

/** Construye la sesión devuelta al frontend (token + usuario + org + permisos). */
const buildSession = async (userId) => {
  const ctx = await findUserAccessContext(userId)
  return {
    token: buildToken(userId),
    user: {
      id: ctx.id,
      name: ctx.name,
      email: ctx.email,
      isSuperAdmin: ctx.isSuperAdmin,
      organizationId: ctx.organizationId,
      role: ctx.roleId ? { id: ctx.roleId, name: ctx.roleName } : null,
    },
    organization: ctx.organization,
    permissions: effectivePermissions(ctx),
  }
}

/**
 * Auto-registro: crea la organización (plan FREE), clona los roles por
 * defecto y crea el usuario administrador de esa organización. Todo en una
 * transacción para no dejar organizaciones huérfanas.
 */
export const registerOrganization = async ({ organizationName, name, email, password }) => {
  const exists = await findUserByEmail(email)
  if (exists) throw new AppError('El email ya está registrado', 400)

  const freePlan = await prisma.plan.findUnique({ where: { key: 'FREE' } })
  if (!freePlan) throw new AppError('No hay un plan disponible para el registro', 500)

  const hashed = await bcrypt.hash(password, 10)

  const base = slugify(organizationName) || 'org'
  let slug = base
  let suffix = 1
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix++}`
  }

  const userId = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name: organizationName, slug, planId: freePlan.id },
    })
    const roles = await seedOrganizationRoles(tx, org.id)
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashed,
        organizationId: org.id,
        roleId: roles[OWNER_ROLE_NAME].id,
      },
    })
    return user.id
  })

  return buildSession(userId)
}

export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email)
  if (!user) throw new AppError('Credenciales inválidas', 401)

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new AppError('Credenciales inválidas', 401)

  if (user.organization && user.organization.status === 'SUSPENDED') {
    throw new AppError('Tu organización está suspendida', 403)
  }

  return buildSession(user.id)
}
