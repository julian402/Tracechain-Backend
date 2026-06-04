import Joi from 'joi'

export const createOrgDto = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().min(2).max(60).pattern(/^[a-z0-9-]+$/).optional(),
  planId: Joi.string().uuid().required(),
})

export const changePlanDto = Joi.object({
  planId: Joi.string().uuid().required(),
})

export const changeStatusDto = Joi.object({
  status: Joi.string().valid('ACTIVE', 'SUSPENDED').required(),
})

export const updateOrgDto = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  slug: Joi.string().min(2).max(60).pattern(/^[a-z0-9-]+$/).optional(),
})
