import Joi from 'joi'

export const createSupplierDto = Joi.object({
  name: Joi.string().min(2).max(120).required().messages({
    'string.empty': 'El nombre del proveedor es obligatorio',
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'any.required': 'El nombre del proveedor es obligatorio',
  }),
  taxId: Joi.string().allow('').optional(),
  contact: Joi.string().allow('').optional(),
  phone: Joi.string().allow('').optional(),
  email: Joi.string().email({ tlds: { allow: false } }).allow('').optional().messages({
    'string.email': 'Ingresa un correo electrónico válido',
  }),
  notes: Joi.string().allow('').optional(),
})

export const updateSupplierDto = createSupplierDto.fork(['name'], (schema) => schema.optional())
