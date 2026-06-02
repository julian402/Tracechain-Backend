import prisma from '../../config/db.js'

export const findUserByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } })
}

export const createUser = (data) => {
  return prisma.user.create({ data })
}