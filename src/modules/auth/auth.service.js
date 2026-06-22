import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import prisma from '../../config/db.js'
import { AppError } from '../../shared/AppError.js'
import {
  findUserByEmail,
  setUserOtp,
  clearUserOtp,
  upsertPendingRegistration,
  findPendingRegistration,
  deletePendingRegistration,
} from './auth.repository.js'
import { findUserAccessContext, effectivePermissions } from '../../shared/access.js'
import { seedOrganizationRoles, OWNER_ROLE_NAME } from '../../shared/rbac.js'
import { sendEmail } from '../../shared/email/email.service.js'
import { otpCodeEmail } from '../../shared/email/templates.js'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutos

/** Genera un código OTP de 6 dígitos en texto plano. */
const generateOtpCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')

/** Envía el código OTP por correo; lanza 502 si el envío falla. */
const sendOtpEmail = async (to, name, code) => {
  try {
    await sendEmail({
      to,
      subject: 'Tu código de acceso a TraceChain',
      html: otpCodeEmail({ name, code }),
    })
  } catch (error) {
    console.error('No se pudo enviar el código OTP:', error.message)
    throw new AppError('No se pudo enviar el código de verificación. Intenta de nuevo.', 502)
  }
}

/** Genera un código OTP, lo guarda (hasheado) en el usuario y lo envía. */
const issueOtp = async (user) => {
  const code = generateOtpCode()
  const hashed = await bcrypt.hash(code, 10)
  await setUserOtp(user.id, hashed, new Date(Date.now() + OTP_TTL_MS))
  await sendOtpEmail(user.email, user.name, code)
}

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

/** Resuelve un slug único a partir del slug pedido o del nombre de la org. */
const resolveUniqueSlug = async (requestedSlug, organizationName) => {
  const base = slugify(requestedSlug || organizationName) || 'org'
  let slug = base
  let suffix = 1
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix++}`
  }
  return slug
}

/**
 * Paso 1 del registro: valida los datos y NO crea nada todavía. Guarda un
 * registro pendiente (contraseña y código hasheados) y envía un código de
 * verificación al correo. La organización/usuario se crean recién al verificar.
 */
export const startRegistration = async ({ organizationName, slug: requestedSlug, name, email, password }) => {
  const exists = await findUserByEmail(email)
  if (exists) throw new AppError('El email ya está registrado', 400)

  const freePlan = await prisma.plan.findUnique({ where: { key: 'FREE' } })
  if (!freePlan) throw new AppError('No hay un plan disponible para el registro', 500)

  const hashedPassword = await bcrypt.hash(password, 10)
  const code = generateOtpCode()
  const hashedCode = await bcrypt.hash(code, 10)

  await upsertPendingRegistration({
    organizationName,
    slug: requestedSlug || null,
    name,
    email,
    password: hashedPassword,
    otpCode: hashedCode,
    otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
  })

  await sendOtpEmail(email, name, code)
  return { otpRequired: true, email }
}

/**
 * Paso 2 del registro: valida el código y recién entonces crea la organización
 * (plan FREE), clona los roles por defecto y crea el usuario administrador, todo
 * en una transacción. Borra el registro pendiente y devuelve la sesión.
 */
export const verifyRegistration = async ({ email, code }) => {
  const pending = await findPendingRegistration(email)
  if (!pending) {
    throw new AppError('No hay un registro pendiente para este correo. Inicia el registro de nuevo.', 404)
  }

  if (pending.otpExpiresAt.getTime() < Date.now()) {
    await deletePendingRegistration(email)
    throw new AppError('El código ha expirado. Inicia el registro de nuevo.', 401)
  }

  const valid = await bcrypt.compare(code, pending.otpCode)
  if (!valid) throw new AppError('Código inválido o expirado', 401)

  // Re-chequea que nadie haya tomado el correo mientras tanto.
  const exists = await findUserByEmail(email)
  if (exists) {
    await deletePendingRegistration(email)
    throw new AppError('El email ya está registrado', 400)
  }

  const freePlan = await prisma.plan.findUnique({ where: { key: 'FREE' } })
  if (!freePlan) throw new AppError('No hay un plan disponible para el registro', 500)

  const slug = await resolveUniqueSlug(pending.slug, pending.organizationName)

  const userId = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name: pending.organizationName, slug, planId: freePlan.id },
    })
    const roles = await seedOrganizationRoles(tx, org.id)
    const user = await tx.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        password: pending.password,
        organizationId: org.id,
        roleId: roles[OWNER_ROLE_NAME].id,
      },
    })
    return user.id
  })

  await deletePendingRegistration(email)
  return buildSession(userId)
}

/** Reenvía un nuevo código a un registro pendiente. */
export const resendRegistrationOtp = async ({ email }) => {
  const pending = await findPendingRegistration(email)
  if (pending) {
    const code = generateOtpCode()
    const hashedCode = await bcrypt.hash(code, 10)
    await upsertPendingRegistration({
      organizationName: pending.organizationName,
      slug: pending.slug,
      name: pending.name,
      email: pending.email,
      password: pending.password,
      otpCode: hashedCode,
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
    })
    await sendOtpEmail(email, pending.name, code)
  }
  return { otpRequired: true, email }
}

/**
 * Paso 1 del login: valida credenciales y, si son correctas, envía un código
 * de verificación (2FA) al correo. NO devuelve sesión todavía.
 */
export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email)
  if (!user) throw new AppError('Credenciales inválidas', 401)

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new AppError('Credenciales inválidas', 401)

  if (user.organization && user.organization.status === 'SUSPENDED') {
    throw new AppError('Tu organización está suspendida', 403)
  }

  await issueOtp(user)
  return { otpRequired: true, email: user.email }
}

/** Paso 2 del login: valida el código OTP y devuelve la sesión completa. */
export const verifyOtp = async ({ email, code }) => {
  const user = await findUserByEmail(email)
  if (!user || !user.otpCode || !user.otpExpiresAt) {
    throw new AppError('Código inválido o expirado', 401)
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    await clearUserOtp(user.id)
    throw new AppError('El código ha expirado. Solicita uno nuevo.', 401)
  }

  const valid = await bcrypt.compare(code, user.otpCode)
  if (!valid) throw new AppError('Código inválido o expirado', 401)

  await clearUserOtp(user.id)
  return buildSession(user.id)
}

/** Reenvía un nuevo código OTP a un usuario que ya pasó el paso 1. */
export const resendOtp = async ({ email }) => {
  const user = await findUserByEmail(email)
  // Respuesta genérica para no revelar si el correo existe.
  if (user) await issueOtp(user)
  return { otpRequired: true, email }
}

export const getCurrentSession = (userId) => buildSession(userId)
