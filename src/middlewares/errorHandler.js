import { AppError } from '../shared/AppError.js'

export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    })
  }

  console.error(err)
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
}