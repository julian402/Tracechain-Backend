import { createVisitWithFindings, findAllVisits, findVisitById, findVisitsByLot, updateVisitStatus } from './inspections.repository.js'
import { logAction } from '../../shared/audit.helper.js'
import { AppError } from '../../shared/AppError.js'
import { sendEmail } from '../../shared/email/email.service.js'
import { inspectionAssignedEmail } from '../../shared/email/templates.js'

export const createVisit = async ({ findings, ...visitData }, { userId, organizationId }) => {
  const visit = await createVisitWithFindings(visitData, findings, userId, organizationId)

  await logAction({
    action: 'VISITA_EXTERNA',
    entity: 'Visit',
    entityId: visit.id,
    userId,
    organizationId,
    lotId: visit.lotId ?? null,
    newData: visit
  })

  for (const finding of visit.findings) {
    await logAction({
      action: `INSPECTIONS_${finding.type}`,
      entity: 'Finding',
      entityId: finding.id,
      userId,
      organizationId,
      lotId: visit.lotId ?? null,
      newData: finding
    })
  }

  // Notifica por correo al responsable asignado (si lo hay). Fire-and-forget:
  // no se hace await para no bloquear la respuesta HTTP (el SMTP de Gmail es
  // lento). El correo se envía en segundo plano y los errores solo se loggean.
  if (visit.responsible?.email) {
    sendEmail({
      to: visit.responsible.email,
      subject: 'Te asignaron como responsable de una inspección — TraceChain',
      html: inspectionAssignedEmail({
        responsibleName: visit.responsible.name,
        visit,
        appUrl: process.env.APP_URL
      })
    }).catch((error) => {
      console.error('No se pudo notificar al responsable de la inspección:', error.message)
    })
  }

  return visit
}

export const getAllVisits = (filters) => findAllVisits(filters)

export const getVisitById = async (id, organizationId) => {
  const visit = await findVisitById(id, organizationId)
  if (!visit) throw new AppError('Visita no encontrada', 404)
  return visit
}

export const getVisitsByLot = async (lotId, organizationId) => findVisitsByLot(lotId, organizationId)

export const changeVisitStatus = async (id, status, { userId, organizationId }) => {
  const visit = await findVisitById(id, organizationId)
  if (!visit) throw new AppError('Visita no encontrada', 404)

  const updated = await updateVisitStatus(id, status)

  await logAction({
    action: 'INSPECTIONS_STATUS_CHANGED',
    entity: 'Visit',
    entityId: id,
    userId,
    organizationId,
    lotId: updated.lotId ?? null,
    oldData: { status: visit.status },
    newData: { status: updated.status }
  })

  return updated
}
