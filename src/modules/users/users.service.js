import bcrypt from 'bcryptjs'
import { findAllUsers, findUserById, updateUser, deleteUser } from './users.repository.js'
import { AppError } from '../../shared/AppError.js'

export const getAllUsers = () => findAllUsers()

export const getUserById = async (id) => {
  const user = await findUserById(id)
  if (!user) throw new AppError('Usuario no encontrado', 404)
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export const updateUserService = async (id, data, requestorRole) => {
  const user = await findUserById(id)
  if (!user) throw new AppError('Usuario no encontrado', 404)
  const updateData = { ...data }
  if (requestorRole !== 'ADMIN') delete updateData.role
  return updateUser(id, updateData)
}

export const changePassword = async (id, { currentPassword, newPassword }) => {
  const user = await findUserById(id)
  if (!user) throw new AppError('Usuario no encontrado', 404)

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) throw new AppError('Contraseña actual incorrecta', 400)

  const hashed = await bcrypt.hash(newPassword, 10)
  return updateUser(id, { password: hashed })
}

export const deleteUserService = async (id) => {
  const user = await findUserById(id)
  if (!user) throw new AppError('Usuario no encontrado', 404)
  return deleteUser(id)
}