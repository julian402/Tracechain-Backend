import prisma from '../../config/db.js'

const userSelect = {
  id: true,
  name: true,
  email: true,
  organizationId: true,
  isSuperAdmin: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true } }
}

export const findAllUsers = (organizationId) => {
  return prisma.user.findMany({
    where: organizationId ? { organizationId } : {},
    select: userSelect,
    orderBy: { createdAt: 'desc' }
  })
}

// Vista global del super admin: todos los usuarios de todas las organizaciones.
export const findAllUsersGlobal = () => {
  return prisma.user.findMany({
    select: {
      ...userSelect,
      isSuperAdmin: true,
      organization: { select: { id: true, name: true, slug: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const findUserById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: { ...userSelect, password: true }
  })
}

export const createUser = (data) => {
  return prisma.user.create({ data, select: userSelect })
}

export const updateUser = (id, data) => {
  return prisma.user.update({ where: { id }, data, select: userSelect })
}

export const deleteUser = (id) => {
  return prisma.user.delete({ where: { id } })
}

export const countUsers = (organizationId) => {
  return prisma.user.count({ where: organizationId ? { organizationId } : {} })
}

// Cuenta usuarios que tienen un rol concreto dentro de una organización.
export const countUsersWithRole = (roleId, organizationId) => {
  return prisma.user.count({ where: { roleId, organizationId } })
}

export const findRoleInOrg = (roleId, organizationId) => {
  return prisma.role.findFirst({ where: { id: roleId, organizationId } })
}
