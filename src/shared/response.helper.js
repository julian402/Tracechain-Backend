export const successResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ status: 'success', data })
}

export const errorResponse = (res, message, statusCode = 500) => {
  res.status(statusCode).json({ status: 'error', message })
}