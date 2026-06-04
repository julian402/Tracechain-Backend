import { createAuditLog } from '../modules/audit/audit.repository.js'

export const logAction = ({ action, entity, entityId, userId, organizationId, lotId = null, oldData = null, newData = null }) => {
  return createAuditLog({
    action,
    entity,
    entityId,
    userId,
    organizationId,
    lotId,
    oldData,
    newData
  })
}
