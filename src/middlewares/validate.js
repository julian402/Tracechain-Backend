export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false })
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details.map(d => d.message).join(', ')
    })
  }
  req.body = value
  next()
}