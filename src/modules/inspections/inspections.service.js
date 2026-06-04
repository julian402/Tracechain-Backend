import { createVisitWithFindings, findAllVisits, findVisitById, findVisitsByLot } from './inspections.repository.js'
import { logAction } from '../../shared/audit.helper.js'
import { AppError } from '../../shared/AppError.js'

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

  return visit
}

export const getAllVisits = (organizationId) => findAllVisits(organizationId)

export const getVisitById = async (id, organizationId) => {
  const visit = await findVisitById(id, organizationId)
  if (!visit) throw new AppError('Visita no encontrada', 404)
  return visit
}

export const getVisitsByLot = async (lotId, organizationId) => findVisitsByLot(lotId, organizationId)
