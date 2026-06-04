import Joi from 'joi'

export const createRoleDto = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  description: Joi.string().max(200).allow('', null).optional(),
  permissions: Joi.array().items(Joi.string()).default([])
})

export const updateRoleDto = Joi.object({
  name: Joi.string().min(2).max(60).optional(),
  description: Joi.string().max(200).allow('', null).optional()
})

export const setPermissionsDto = Joi.object({
  permissions: Joi.array().items(Joi.string()).required()
})
