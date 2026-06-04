import {
  findRolesByOrg,
  findRoleById,
  findRoleByName,
  findPermissionIdsByKeys,
  createRole,
  updateRoleMeta,
  setRolePermissions,
  deleteRole
} from './roles.repository.js'
import { AppError } from '../../shared/AppError.js'
import { OWNER_ROLE_NAME } from '../../shared/rbac.js'

// Formato de salida: permisos como array de keys + conteo de usuarios.
const toDTO = (role) => ({
  id: role.id,
  name: role.name,
  description: role.description,
  isSystem: role.isSystem,
  permissions: (role.permissions ?? []).map((rp) => rp.permission.key),
  usersCount: role._count?.users ?? 0
})

export const getRoles = async (organizationId) => {
  const roles = await findRolesByOrg(organizationId)
  return roles.map(toDTO)
}

export const getRole = async (id, organizationId) => {
  const role = await findRoleById(id, organizationId)
  if (!role) throw new AppError('Rol no encontrado', 404)
  return toDTO(role)
}

export const createRoleService = async ({ name, description, permissions = [] }, organizationId) => {
  const exists = await findRoleByName(name, organizationId)
  if (exists) throw new AppError('Ya existe un rol con ese nombre', 400)

  const permissionIds = await findPermissionIdsByKeys(permissions)
  const role = await createRole({ name, description, organizationId, permissionIds })
  return toDTO(role)
}

export const updateRoleService = async (id, { name, description }, organizationId) => {
  const role = await findRoleById(id, organizationId)
  if (!role) throw new AppError('Rol no encontrado', 404)
  if (role.isSystem && name && name !== role.name) {
    throw new AppError('No se puede renombrar un rol del sistema', 400)
  }

  if (name && name !== role.name) {
    const dup = await findRoleByName(name, organizationId)
    if (dup) throw new AppError('Ya existe un rol con ese nombre', 400)
  }

  const data = {}
  if (name !== undefined) data.name = name
  if (description !== undefined) data.description = description
  const updated = await updateRoleMeta(id, data)
  return toDTO(updated)
}

export const setPermissionsService = async (id, permissions, organizationId) => {
  const role = await findRoleById(id, organizationId)
  if (!role) throw new AppError('Rol no encontrado', 404)

  // El rol propietario (ORG_ADMIN) no puede perder la gestión de roles/usuarios
  // para evitar dejar a la organización sin administración.
  if (role.name === OWNER_ROLE_NAME) {
    const required = ['roles:manage', 'users:manage']
    if (!required.every((k) => permissions.includes(k))) {
      throw new AppError('El rol administrador debe conservar la gestión de roles y usuarios', 400)
    }
  }

  const permissionIds = await findPermissionIdsByKeys(permissions)
  const updated = await setRolePermissions(id, permissionIds)
  return toDTO(updated)
}

export const deleteRoleService = async (id, organizationId) => {
  const role = await findRoleById(id, organizationId)
  if (!role) throw new AppError('Rol no encontrado', 404)
  if (role.isSystem) throw new AppError('No se puede eliminar un rol del sistema', 400)
  if ((role._count?.users ?? 0) > 0) {
    throw new AppError('No se puede eliminar un rol con usuarios asignados', 400)
  }
  await deleteRole(id)
  return { message: 'Rol eliminado correctamente' }
}
