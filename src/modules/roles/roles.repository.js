import prisma from '../../config/db.js'

const roleInclude = {
  permissions: { select: { permission: { select: { key: true } } } },
  _count: { select: { users: true } }
}

export const findRolesByOrg = (organizationId) => {
  return prisma.role.findMany({
    where: { organizationId },
    include: roleInclude,
    orderBy: { createdAt: 'asc' }
  })
}

export const findRoleById = (id, organizationId) => {
  return prisma.role.findFirst({
    where: { id, organizationId },
    include: roleInclude
  })
}

export const findRoleByName = (name, organizationId) => {
  return prisma.role.findFirst({ where: { name, organizationId } })
}

export const findPermissionIdsByKeys = async (keys) => {
  const perms = await prisma.permission.findMany({
    where: { key: { in: keys } },
    select: { id: true }
  })
  return perms.map((p) => p.id)
}

export const createRole = ({ name, description, organizationId, permissionIds }) => {
  return prisma.role.create({
    data: {
      name,
      description,
      organizationId,
      isSystem: false,
      permissions: { create: permissionIds.map((permissionId) => ({ permissionId })) }
    },
    include: roleInclude
  })
}

export const updateRoleMeta = (id, data) => {
  return prisma.role.update({ where: { id }, data, include: roleInclude })
}

// Reemplaza por completo el set de permisos del rol en una transacción.
export const setRolePermissions = async (id, permissionIds) => {
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: id } }),
    prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId: id, permissionId }))
    })
  ])
  return prisma.role.findUnique({ where: { id }, include: roleInclude })
}

export const deleteRole = (id) => {
  return prisma.role.delete({ where: { id } })
}
