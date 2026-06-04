import bcrypt from 'bcryptjs'
import {
  findAllUsers,
  findAllUsersGlobal,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
  countUsers,
  countUsersWithRole,
  findRoleInOrg
} from './users.repository.js'
import { AppError } from '../../shared/AppError.js'
import { getPlanLimit } from '../../shared/plans.js'
import { OWNER_ROLE_NAME } from '../../shared/rbac.js'

const stripPassword = ({ password: _pw, ...rest }) => rest

export const getAllUsers = (organizationId) => findAllUsers(organizationId)

export const getAllUsersGlobal = () => findAllUsersGlobal()

export const getUserById = async (id, organizationId, isSuperAdmin = false) => {
  const user = await findUserById(id)
  if (!user || (!isSuperAdmin && user.organizationId !== organizationId))
    throw new AppError('Usuario no encontrado', 404)
  return stripPassword(user)
}

export const createUserService = async ({ name, email, password, roleId, organizationId: bodyOrgId }, { organizationId, plan, isSuperAdmin = false }) => {
  const effectiveOrgId = isSuperAdmin ? (bodyOrgId ?? organizationId) : organizationId

  const role = await findRoleInOrg(roleId, effectiveOrgId)
  if (!role) throw new AppError('El rol indicado no pertenece a la organización', 400)

  if (!isSuperAdmin) {
    const maxUsers = getPlanLimit(plan, 'users')
    if (maxUsers != null) {
      const current = await countUsers(effectiveOrgId)
      if (current >= maxUsers) {
        throw new AppError(`Límite del plan alcanzado (${maxUsers} usuarios). Mejora tu plan para agregar más.`, 403)
      }
    }
  }

  const hashed = await bcrypt.hash(password, 10)
  try {
    return await createUser({ name, email, password: hashed, organizationId: effectiveOrgId, roleId })
  } catch (err) {
    if (err.code === 'P2002') throw new AppError('El email ya está registrado', 400)
    throw err
  }
}

export const updateUserService = async (id, data, { organizationId, canManage, requestorId, isSuperAdmin = false }) => {
  const user = await findUserById(id)
  if (!user || (!isSuperAdmin && user.organizationId !== organizationId))
    throw new AppError('Usuario no encontrado', 404)

  const isOwn = requestorId === id
  if (!isOwn && !canManage) throw new AppError('No autorizado', 403)

  const updateData = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email

  if (data.roleId !== undefined) {
    if (!canManage) throw new AppError('No autorizado para cambiar el rol', 403)
    const orgId = isSuperAdmin ? user.organizationId : organizationId
    const role = await findRoleInOrg(data.roleId, orgId)
    if (!role) throw new AppError('El rol indicado no pertenece a la organización', 400)

    if (user.role?.name === OWNER_ROLE_NAME && role.name !== OWNER_ROLE_NAME) {
      const admins = await countUsersWithRole(user.roleId, orgId)
      if (admins <= 1) throw new AppError('La organización debe tener al menos un administrador', 400)
    }
    updateData.roleId = data.roleId
  }

  try {
    return await updateUser(id, updateData)
  } catch (err) {
    if (err.code === 'P2002') throw new AppError('El email ya está registrado', 400)
    throw err
  }
}

export const changePassword = async (id, { currentPassword, newPassword }) => {
  const user = await findUserById(id)
  if (!user) throw new AppError('Usuario no encontrado', 404)

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) throw new AppError('Contraseña actual incorrecta', 400)

  const hashed = await bcrypt.hash(newPassword, 10)
  return updateUser(id, { password: hashed })
}

export const deleteUserService = async (id, organizationId, isSuperAdmin = false) => {
  const user = await findUserById(id)
  if (!user || (!isSuperAdmin && user.organizationId !== organizationId))
    throw new AppError('Usuario no encontrado', 404)

  if (user.role?.name === OWNER_ROLE_NAME) {
    const admins = await countUsersWithRole(user.roleId, user.organizationId)
    if (admins <= 1) throw new AppError('La organización debe tener al menos un administrador', 400)
  }

  return deleteUser(id)
}
