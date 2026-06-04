import prisma from '../../config/db.js'

export const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
      organization: { select: { status: true } },
    },
  })
}
