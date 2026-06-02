import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { findUserByEmail, createUser } from './auth.repository.js'
import { AppError } from '../../shared/AppError.js'

export const register = async ({ name, email, password, role }) => {
  const exists = await findUserByEmail(email)
  if (exists) throw new AppError('El email ya está registrado', 400)

  const hashed = await bcrypt.hash(password, 10)
  const user = await createUser({ name, email, password: hashed, role })

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email)
  if (!user) throw new AppError('Credenciales inválidas', 401)

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new AppError('Credenciales inválidas', 401)

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  const { password: _, ...userWithoutPassword } = user
  return { token, user: userWithoutPassword }
}