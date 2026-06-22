import Joi from 'joi'

export const createVisitDto = Joi.object({
  visitType: Joi.string().valid('AUDITORIA', 'INTERVENTORIA', 'INSPECCION').required(),
  visitDate: Joi.date().required(),
  actReference: Joi.string().optional(),
  auditorEntity: Joi.string().required(),
  auditorName: Joi.string().required(),
  auditedProcess: Joi.string().optional(),
  objective: Joi.string().optional(),
  responsibleId: Joi.string().uuid().optional().messages({ 'string.guid': 'El responsable seleccionado no es válido' }),
  commitmentDate: Joi.date().optional(),
  correctiveActions: Joi.string().optional(),
  lotId: Joi.string().uuid().optional(),
  findings: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('NO_CONFORMIDAD', 'OBSERVACION', 'OPORTUNIDAD').required(),
      priority: Joi.string().valid('ALTA', 'MEDIA', 'BAJA').required(),
      criteria: Joi.string().optional(),
      description: Joi.string().required(),
      deadline: Joi.date().optional()
    })
  ).min(1).required()
})

export const updateVisitStatusDto = Joi.object({
  status: Joi.string().valid('PENDIENTE', 'EN_CURSO', 'RESUELTO').required().messages({
    'any.only': 'Selecciona un estado válido',
    'any.required': 'El estado es obligatorio',
  })
})