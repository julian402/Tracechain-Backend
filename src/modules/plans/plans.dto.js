import Joi from 'joi'
import { BILLING_PERIODS } from '../../shared/plans.js'

// Límites: objeto abierto clave->entero (>= -1; -1/null = ilimitado).
// Features: objeto abierto clave->booleano.
// Se mantienen abiertos a propósito para escalar sin cambiar el DTO.
const limitsSchema = Joi.object().pattern(
  Joi.string(),
  Joi.number().integer().min(-1).allow(null)
)
const featuresSchema = Joi.object().pattern(Joi.string(), Joi.boolean())

export const createPlanDto = Joi.object({
  key: Joi.string().uppercase().pattern(/^[A-Z0-9_]+$/).min(2).max(30).required(),
  name: Joi.string().min(2).max(60).required(),
  description: Joi.string().allow('', null).max(280).optional(),
  price: Joi.number().min(0).default(0),
  currency: Joi.string().length(3).uppercase().default('USD'),
  billingPeriod: Joi.string().valid(...BILLING_PERIODS).default('MONTHLY'),
  isActive: Joi.boolean().default(true),
  sortOrder: Joi.number().integer().default(0),
  limits: limitsSchema.default({}),
  features: featuresSchema.default({}),
  stripeProductId: Joi.string().allow('', null).optional(),
  stripePriceId: Joi.string().allow('', null).optional(),
})

export const updatePlanDto = Joi.object({
  name: Joi.string().min(2).max(60).optional(),
  description: Joi.string().allow('', null).max(280).optional(),
  price: Joi.number().min(0).optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  billingPeriod: Joi.string().valid(...BILLING_PERIODS).optional(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().optional(),
  limits: limitsSchema.optional(),
  features: featuresSchema.optional(),
  stripeProductId: Joi.string().allow('', null).optional(),
  stripePriceId: Joi.string().allow('', null).optional(),
}).min(1)
