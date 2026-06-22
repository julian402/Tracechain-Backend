import prisma from '../../config/db.js'

export const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      otpCode: true,
      otpExpiresAt: true,
      organization: { select: { status: true } },
    },
  })
}

export const setUserOtp = (userId, otpCode, otpExpiresAt) => {
  return prisma.user.update({
    where: { id: userId },
    data: { otpCode, otpExpiresAt },
  })
}

export const clearUserOtp = (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: { otpCode: null, otpExpiresAt: null },
  })
}

/** Crea o reemplaza (por email) el registro pendiente de verificación. */
export const upsertPendingRegistration = (data) => {
  const { email, ...rest } = data
  return prisma.pendingRegistration.upsert({
    where: { email },
    update: rest,
    create: data,
  })
}

export const findPendingRegistration = (email) => {
  return prisma.pendingRegistration.findUnique({ where: { email } })
}

export const deletePendingRegistration = (email) => {
  return prisma.pendingRegistration.delete({ where: { email } })
}
