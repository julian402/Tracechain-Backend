import Joi from 'joi'

const limitsSchema = Joi.object().pattern(
  Joi.string(),
  Joi.alternatives().try(Joi.number().integer().min(0), Joi.valid(null))
)
const featuresSchema = Joi.object().pattern(Joi.string(), Joi.boolean())
const analyticsConfigSchema = Joi.object({
  dashboardUrl: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null).optional().messages({
    'string.uriCustomScheme': 'La URL del dashboard debe iniciar con http:// o https://',
    'string.uri': 'Ingresa una URL válida para el dashboard',
  }),
}).unknown(false)
const slugSchema = Joi.string().lowercase().min(2).max(60).pattern(/^[a-z0-9-]+$/)

export const createOrgDto = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'El nombre de la organización es obligatorio',
    'string.min': 'El nombre de la organización debe tener al menos 2 caracteres',
    'string.max': 'El nombre de la organización no puede superar 100 caracteres',
    'any.required': 'El nombre de la organización es obligatorio',
  }),
  slug: slugSchema.optional().messages({
    'string.min': 'El slug debe tener al menos 2 caracteres',
    'string.max': 'El slug no puede superar 60 caracteres',
    'string.pattern.base': 'El slug solo puede contener letras, números y guiones',
  }),
  planId: Joi.string().uuid().required().messages({
    'string.guid': 'Selecciona un plan válido',
    'any.required': 'Selecciona un plan',
  }),
  customLimits: limitsSchema.optional(),
  customFeatures: featuresSchema.optional(),
  analyticsConfig: analyticsConfigSchema.optional(),
})

export const changePlanDto = Joi.object({
  planId: Joi.string().uuid().required(),
})

export const changeStatusDto = Joi.object({
  status: Joi.string().valid('ACTIVE', 'SUSPENDED').required(),
})

export const updateOrgDto = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'El nombre de la organización debe tener al menos 2 caracteres',
    'string.max': 'El nombre de la organización no puede superar 100 caracteres',
  }),
  slug: slugSchema.optional().messages({
    'string.min': 'El slug debe tener al menos 2 caracteres',
    'string.max': 'El slug no puede superar 60 caracteres',
    'string.pattern.base': 'El slug solo puede contener letras, números y guiones',
  }),
})

export const updateAdminOrgDto = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'El nombre de la organización debe tener al menos 2 caracteres',
    'string.max': 'El nombre de la organización no puede superar 100 caracteres',
  }),
  slug: slugSchema.optional().messages({
    'string.min': 'El slug debe tener al menos 2 caracteres',
    'string.max': 'El slug no puede superar 60 caracteres',
    'string.pattern.base': 'El slug solo puede contener letras, números y guiones',
  }),
  planId: Joi.string().uuid().optional().messages({
    'string.guid': 'Selecciona un plan válido',
  }),
  customLimits: limitsSchema.optional(),
  customFeatures: featuresSchema.optional(),
  analyticsConfig: analyticsConfigSchema.optional(),
}).min(1)
