import Joi from 'joi'

const lotName = Joi.string().min(2).max(100).messages({
  'string.empty': 'El nombre del lote es obligatorio',
  'string.min': 'El nombre del lote debe tener al menos 2 caracteres',
  'string.max': 'El nombre del lote no puede superar 100 caracteres',
})

export const createLotDto = Joi.object({
  name: lotName.required().messages({ 'any.required': 'El nombre del lote es obligatorio' }),
  quantity: Joi.number().positive().required().messages({
    'number.base': 'La cantidad debe ser un número',
    'number.positive': 'La cantidad debe ser mayor que cero',
    'any.required': 'La cantidad es obligatoria',
  }),
  unit: Joi.string().max(20).required().messages({
    'string.empty': 'La unidad es obligatoria',
    'string.max': 'La unidad no puede superar 20 caracteres',
    'any.required': 'La unidad es obligatoria',
  }),
  productionDate: Joi.date().required().messages({
    'date.base': 'La fecha de producción no es válida',
    'any.required': 'La fecha de producción es obligatoria',
  }),
  expirationDate: Joi.date().greater(Joi.ref('productionDate')).required().messages({
    'date.base': 'La fecha de vencimiento no es válida',
    'date.greater': 'La fecha de vencimiento debe ser posterior a la fecha de producción',
    'any.required': 'La fecha de vencimiento es obligatoria',
  }),
  sanitaryRecord: Joi.string().optional(),
  storageTemp: Joi.number().optional().messages({ 'number.base': 'La temperatura debe ser un número' }),
  storageHumidity: Joi.number().min(0).max(100).optional().messages({
    'number.base': 'La humedad debe ser un número',
    'number.min': 'La humedad no puede ser menor que 0',
    'number.max': 'La humedad no puede ser mayor que 100',
  }),
  notes: Joi.string().optional(),
  parentLotId: Joi.string().uuid().optional().messages({ 'string.guid': 'El lote padre no es válido' }),
  supplierId: Joi.string().uuid().allow(null, '').optional().messages({ 'string.guid': 'El proveedor no es válido' }),
  ingredients: Joi.array().items(
    Joi.object({
      rawMaterialBatchId: Joi.string().uuid().required().messages({
        'string.guid': 'La materia prima no es válida',
        'any.required': 'Selecciona la materia prima utilizada',
      }),
      quantityUsed: Joi.number().positive().required().messages({
        'number.base': 'La cantidad usada debe ser un número',
        'number.positive': 'La cantidad usada debe ser mayor que cero',
        'any.required': 'La cantidad usada es obligatoria',
      }),
      unit: Joi.string().max(20).required().messages({
        'string.empty': 'La unidad es obligatoria',
        'any.required': 'La unidad es obligatoria',
      }),
    })
  ).optional()
})

export const updateLotStatusDto = Joi.object({
  status: Joi.string().valid('ACTIVE', 'EXPIRED', 'QUARANTINE', 'DEPLETED').required().messages({
    'any.only': 'Selecciona un estado válido para el lote',
    'any.required': 'El estado del lote es obligatorio',
  })
})

export const updateLotDto = Joi.object({
  name: lotName.optional(),
  quantity: Joi.number().positive().optional().messages({
    'number.base': 'La cantidad debe ser un número',
    'number.positive': 'La cantidad debe ser mayor que cero',
  }),
  unit: Joi.string().max(20).optional().messages({ 'string.max': 'La unidad no puede superar 20 caracteres' }),
  productionDate: Joi.date().optional().messages({ 'date.base': 'La fecha de producción no es válida' }),
  expirationDate: Joi.date().optional().messages({ 'date.base': 'La fecha de vencimiento no es válida' }),
  sanitaryRecord: Joi.string().allow('').optional(),
  storageTemp: Joi.number().optional().allow(null).messages({ 'number.base': 'La temperatura debe ser un número' }),
  storageHumidity: Joi.number().min(0).max(100).optional().allow(null).messages({
    'number.base': 'La humedad debe ser un número',
    'number.min': 'La humedad no puede ser menor que 0',
    'number.max': 'La humedad no puede ser mayor que 100',
  }),
  notes: Joi.string().allow('').optional()
})
