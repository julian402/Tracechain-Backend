import jwt from 'jsonwebtoken'
import { AppError } from '../shared/AppError.js'

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No autorizado', 401))
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    next(new AppError('Token inválido o expirado', 401))
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('No tienes permisos para esta acción', 403))
  }
  next()
}