import Joi from 'joi'

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
const passwordMessage = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número'
const slugSchema = Joi.string().lowercase().min(2).max(60).pattern(/^[a-z0-9-]+$/)

export const registerOrgDto = Joi.object({
  organizationName: Joi.string().min(2).max(120).required().messages({
    'string.empty': 'El nombre de la empresa es obligatorio',
    'string.min': 'El nombre de la empresa debe tener al menos 2 caracteres',
    'string.max': 'El nombre de la empresa no puede superar 120 caracteres',
    'any.required': 'El nombre de la empresa es obligatorio',
  }),
  slug: slugSchema.optional().messages({
    'string.min': 'El slug debe tener al menos 2 caracteres',
    'string.max': 'El slug no puede superar 60 caracteres',
    'string.pattern.base': 'El slug solo puede contener letras, números y guiones',
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'El nombre del administrador es obligatorio',
    'string.min': 'El nombre del administrador debe tener al menos 2 caracteres',
    'string.max': 'El nombre del administrador no puede superar 100 caracteres',
    'any.required': 'El nombre del administrador es obligatorio',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'El correo electrónico es obligatorio',
    'string.email': 'Ingresa un correo electrónico válido',
    'any.required': 'El correo electrónico es obligatorio',
  }),
  password: Joi.string().pattern(passwordPattern).required().messages({
    'string.empty': 'La contraseña es obligatoria',
    'string.pattern.base': passwordMessage,
    'any.required': 'La contraseña es obligatoria',
  }),
})

export const loginDto = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'El correo electrónico es obligatorio',
    'string.email': 'Ingresa un correo electrónico válido',
    'any.required': 'El correo electrónico es obligatorio',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'La contraseña es obligatoria',
    'any.required': 'La contraseña es obligatoria',
  }),
})

export const verifyOtpDto = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'El correo electrónico es obligatorio',
    'string.email': 'Ingresa un correo electrónico válido',
    'any.required': 'El correo electrónico es obligatorio',
  }),
  code: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.empty': 'El código es obligatorio',
    'string.length': 'El código debe tener 6 dígitos',
    'string.pattern.base': 'El código solo puede contener números',
    'any.required': 'El código es obligatorio',
  }),
})

export const resendOtpDto = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'El correo electrónico es obligatorio',
    'string.email': 'Ingresa un correo electrónico válido',
    'any.required': 'El correo electrónico es obligatorio',
  }),
})
