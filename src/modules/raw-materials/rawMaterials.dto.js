import Joi from 'joi'

export const createRawMaterialDto = Joi.object({
  name: Joi.string().min(2).max(120).required().messages({
    'string.empty': 'El nombre de la materia prima es obligatorio',
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'any.required': 'El nombre de la materia prima es obligatorio',
  }),
  batchNumber: Joi.string().allow('').optional(),
  quantity: Joi.number().positive().required().messages({
    'number.base': 'La cantidad debe ser un número',
    'number.positive': 'La cantidad debe ser mayor que cero',
    'any.required': 'La cantidad es obligatoria',
  }),
  unit: Joi.string().max(20).required().messages({
    'string.empty': 'La unidad es obligatoria',
    'any.required': 'La unidad es obligatoria',
  }),
  receivedDate: Joi.date().optional(),
  expirationDate: Joi.date().optional(),
  supplierId: Joi.string().uuid().allow(null, '').optional().messages({ 'string.guid': 'El proveedor no es válido' }),
  notes: Joi.string().allow('').optional(),
})

export const updateRawMaterialDto = Joi.object({
  name: Joi.string().min(2).max(120).optional(),
  batchNumber: Joi.string().allow('').optional(),
  quantity: Joi.number().positive().optional().messages({ 'number.positive': 'La cantidad debe ser mayor que cero' }),
  unit: Joi.string().max(20).optional(),
  receivedDate: Joi.date().allow(null).optional(),
  expirationDate: Joi.date().allow(null).optional(),
  supplierId: Joi.string().uuid().allow(null, '').optional().messages({ 'string.guid': 'El proveedor no es válido' }),
  notes: Joi.string().allow('').optional(),
})
