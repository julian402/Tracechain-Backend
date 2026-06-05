import { AppError } from '../shared/AppError.js'

const parseOrigins = (value) =>
  value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []

export const allowedOrigins = parseOrigins(process.env.CORS_ORIGIN || 'http://localhost:5173')

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new AppError('Origen no permitido por CORS', 403))
  },
  credentials: true,
}

export const securityHeaders = (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  })
}
