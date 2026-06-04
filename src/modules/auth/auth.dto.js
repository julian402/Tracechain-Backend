import Joi from 'joi'

export const registerOrgDto = Joi.object({
  organizationName: Joi.string().min(2).max(120).required(),
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

export const loginDto = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})
