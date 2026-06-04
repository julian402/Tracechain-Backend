import Joi from 'joi'

export const createLotDto = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  quantity: Joi.number().positive().required(),
  unit: Joi.string().max(20).required(),
  productionDate: Joi.date().required(),
  expirationDate: Joi.date().greater(Joi.ref('productionDate')).required(),
  sanitaryRecord: Joi.string().optional(),
  storageTemp: Joi.number().optional(),
  storageHumidity: Joi.number().min(0).max(100).optional(),
  notes: Joi.string().optional(),
  parentLotId: Joi.string().uuid().optional()
})

export const updateLotStatusDto = Joi.object({
  status: Joi.string().valid('ACTIVE', 'EXPIRED', 'QUARANTINE', 'DEPLETED').required()
})

export const updateLotDto = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  quantity: Joi.number().positive().optional(),
  unit: Joi.string().max(20).optional(),
  productionDate: Joi.date().optional(),
  expirationDate: Joi.date().optional(),
  sanitaryRecord: Joi.string().allow('').optional(),
  storageTemp: Joi.number().optional().allow(null),
  storageHumidity: Joi.number().min(0).max(100).optional().allow(null),
  notes: Joi.string().allow('').optional()
})