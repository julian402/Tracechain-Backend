/**
 * Catálogo central de límites y features de los planes.
 *
 * Fuente de verdad para que la UI de super admin sepa qué inputs numéricos y
 * qué toggles pintar al crear/editar un plan. Es declarativo: para soportar un
 * nuevo límite o feature en el futuro basta añadir una entrada aquí (no hay
 * migración: `Plan.limits` y `Plan.features` son JSON).
 *
 * Convención de límites: número entero >= 0, o `null`/ausente = ilimitado.
 */

export const PLAN_LIMITS = [
  { key: 'lots', label: 'Lotes', description: 'Cantidad máxima de lotes que puede registrar la organización.', default: 10 },
  { key: 'users', label: 'Usuarios', description: 'Cantidad máxima de usuarios de la organización.', default: 3 },
  { key: 'movements', label: 'Movimientos', description: 'Cantidad máxima de movimientos registrables.', default: null },
]

export const PLAN_FEATURES = [
  { key: 'reports', label: 'Reportes y exportaciones (CSV/PDF)', description: 'Exportar reportes en CSV y PDF.' },
  { key: 'analytics', label: 'Analítica avanzada (Superset)', description: 'Dashboards embebidos vía Apache Superset.' },
  { key: 'advancedMovements', label: 'Movimientos avanzados', description: 'Transformaciones, divisiones y fusiones de lotes.' },
  { key: 'inspections', label: 'Inspecciones y auditorías', description: 'Registrar visitas, hallazgos y auditorías.' },
]

export const PLAN_LIMIT_KEYS = PLAN_LIMITS.map((l) => l.key)
export const PLAN_FEATURE_KEYS = PLAN_FEATURES.map((f) => f.key)

export const BILLING_PERIODS = ['MONTHLY', 'YEARLY', 'ONE_TIME']

/**
 * Lee un límite del plan. Devuelve `null` cuando es ilimitado (clave ausente
 * o valor null/negativo), o un entero >= 0 en caso contrario.
 */
export const getPlanLimit = (plan, key) => {
  const value = plan?.limits?.[key]
  if (value == null || value < 0) return null
  return Number(value)
}

/**
 * Límite efectivo para una organización: primero mira override de la org,
 * si no existe usa el límite del plan.
 */
export const getOrganizationLimit = (organization, key) => {
  const customValue = organization?.customLimits?.[key]
  if (customValue !== undefined) {
    if (customValue == null || customValue < 0) return null
    return Number(customValue)
  }
  return getPlanLimit(organization?.plan, key)
}

export const buildEffectivePlan = (organization) => {
  if (!organization?.plan) return null
  const limits = { ...(organization.plan.limits ?? {}) }
  const features = { ...(organization.plan.features ?? {}) }
  Object.entries(organization.customLimits ?? {}).forEach(([key, value]) => {
    limits[key] = value
  })
  Object.entries(organization.customFeatures ?? {}).forEach(([key, value]) => {
    features[key] = Boolean(value)
  })
  return { ...organization.plan, limits, features }
}

/** Indica si el plan incluye una feature. */
export const planHasFeature = (plan, key) => Boolean(plan?.features?.[key])
