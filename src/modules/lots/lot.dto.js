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