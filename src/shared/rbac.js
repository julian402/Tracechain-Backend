/**
 * Catálogo central de permisos y plantillas de roles.
 *
 * Fuente de verdad del RBAC dinámico: la UI solo ASIGNA permisos existentes
 * a roles, nunca inventa keys nuevas. Usado por el seed y por el registro de
 * organizaciones (clonado de roles por defecto en cada empresa nueva).
 *
 * Formato de permiso: `module:action`.
 */

export const PERMISSIONS = [
  // Dashboard
  { key: 'dashboard:read', module: 'dashboard', action: 'read', label: 'Ver dashboard' },

  // Lotes
  { key: 'lots:read', module: 'lots', action: 'read', label: 'Ver lotes' },
  { key: 'lots:create', module: 'lots', action: 'create', label: 'Crear lotes' },
  { key: 'lots:update', module: 'lots', action: 'update', label: 'Editar lotes' },
  { key: 'lots:delete', module: 'lots', action: 'delete', label: 'Eliminar lotes' },

  // Movimientos
  { key: 'movements:read', module: 'movements', action: 'read', label: 'Ver movimientos' },
  { key: 'movements:create', module: 'movements', action: 'create', label: 'Registrar movimientos' },

  // Auditoría
  { key: 'audit:read', module: 'audit', action: 'read', label: 'Ver auditoría' },

  // Inspecciones
  { key: 'inspections:read', module: 'inspections', action: 'read', label: 'Ver inspecciones' },
  { key: 'inspections:create', module: 'inspections', action: 'create', label: 'Crear inspecciones' },
  { key: 'inspections:update', module: 'inspections', action: 'update', label: 'Actualizar estado de inspecciones' },

  // Inventario (materias primas, proveedores)
  { key: 'inventory:read', module: 'inventory', action: 'read', label: 'Ver inventario y materias primas' },
  { key: 'inventory:create', module: 'inventory', action: 'create', label: 'Registrar materias primas y proveedores' },
  { key: 'inventory:update', module: 'inventory', action: 'update', label: 'Editar inventario y materias primas' },
  { key: 'inventory:delete', module: 'inventory', action: 'delete', label: 'Eliminar inventario y materias primas' },

  // Reportes y analítica
  { key: 'reports:read', module: 'reports', action: 'read', label: 'Exportar reportes (CSV/PDF)' },
  { key: 'analytics:read', module: 'analytics', action: 'read', label: 'Ver analítica (Superset)' },

  // Usuarios (de la organización)
  { key: 'users:read', module: 'users', action: 'read', label: 'Ver usuarios' },
  { key: 'users:manage', module: 'users', action: 'manage', label: 'Gestionar usuarios' },

  // Roles y permisos (de la organización)
  { key: 'roles:read', module: 'roles', action: 'read', label: 'Ver roles' },
  { key: 'roles:manage', module: 'roles', action: 'manage', label: 'Gestionar roles y permisos' },

  // Plataforma (solo SUPER_ADMIN; bypass igualmente cubre estas)
  { key: 'organizations:manage', module: 'organizations', action: 'manage', label: 'Gestionar organizaciones' },
  { key: 'plans:manage', module: 'plans', action: 'manage', label: 'Gestionar planes' },
]

/** Todas las keys de permiso disponibles. */
export const ALL_PERMISSION_KEYS = PERMISSIONS.map((p) => p.key)

/** Permisos a nivel de organización (excluye los de plataforma). */
export const ORG_PERMISSION_KEYS = PERMISSIONS
  .filter((p) => !['organizations', 'plans'].includes(p.module))
  .map((p) => p.key)

/**
 * Plantillas de roles que se clonan en cada organización nueva.
 * `name` -> { description, isSystem, permissions: string[] }
 *
 * `isSystem: true` => no se puede borrar ni renombrar desde la UI; sus
 * permisos sí pueden ajustarse (salvo el ORG_ADMIN, que conserva todo).
 */
export const ROLE_TEMPLATES = {
  ORG_ADMIN: {
    description: 'Administrador de la organización: acceso total dentro de su empresa.',
    isSystem: true,
    permissions: ORG_PERMISSION_KEYS,
  },
  GERENTE: {
    description: 'Gestión operativa completa sin administración de usuarios/roles.',
    isSystem: true,
    permissions: [
      'dashboard:read',
      'lots:read', 'lots:create', 'lots:update', 'lots:delete',
      'movements:read', 'movements:create',
      'audit:read',
      'inspections:read', 'inspections:create', 'inspections:update',
      'inventory:read', 'inventory:create', 'inventory:update', 'inventory:delete',
      'reports:read', 'analytics:read',
    ],
  },
  OPERARIO: {
    description: 'Registro de lotes y movimientos del día a día.',
    isSystem: true,
    permissions: [
      'dashboard:read',
      'lots:read', 'lots:create', 'lots:update',
      'movements:read', 'movements:create',
      'inventory:read', 'inventory:create',
    ],
  },
  AUDITOR: {
    description: 'Lectura de trazabilidad, auditoría, inspecciones y reportes.',
    isSystem: true,
    permissions: [
      'dashboard:read',
      'lots:read',
      'movements:read',
      'audit:read',
      'inspections:read', 'inspections:create', 'inspections:update',
      'inventory:read',
      'reports:read', 'analytics:read',
    ],
  },
}

/** Nombre del rol por defecto del usuario que crea la organización. */
export const OWNER_ROLE_NAME = 'ORG_ADMIN'

/** Rol global de plataforma (super admin). No pertenece a ninguna organización. */
export const SUPER_ADMIN_ROLE_NAME = 'SUPER_ADMIN'

/**
 * Crea las filas de roles de una organización a partir de las plantillas,
 * dentro de una transacción Prisma. Devuelve un mapa nombre -> role creado.
 *
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {string} organizationId
 */
export const seedOrganizationRoles = async (tx, organizationId) => {
  const permissions = await tx.permission.findMany()
  const permByKey = Object.fromEntries(permissions.map((p) => [p.key, p.id]))

  const created = {}
  for (const [name, template] of Object.entries(ROLE_TEMPLATES)) {
    const role = await tx.role.create({
      data: {
        name,
        description: template.description,
        isSystem: template.isSystem,
        organizationId,
        permissions: {
          create: template.permissions
            .filter((key) => permByKey[key])
            .map((key) => ({ permissionId: permByKey[key] })),
        },
      },
    })
    created[name] = role
  }
  return created
}

/**
 * Sincroniza (idempotente, solo agrega) los permisos de plantilla en los roles
 * de sistema ya existentes de todas las organizaciones. Útil tras añadir nuevos
 * permisos al catálogo: propaga las keys nuevas sin recrear orgs ni borrar
 * personalizaciones previas. ORG_ADMIN recibe TODOS los permisos de organización.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export const syncSystemRolePermissions = async (prisma) => {
  const permissions = await prisma.permission.findMany()
  const permByKey = Object.fromEntries(permissions.map((p) => [p.key, p.id]))

  const templateFor = (name) =>
    name === OWNER_ROLE_NAME ? ORG_PERMISSION_KEYS : ROLE_TEMPLATES[name]?.permissions

  const systemRoles = await prisma.role.findMany({
    where: { isSystem: true, organizationId: { not: null }, name: { in: Object.keys(ROLE_TEMPLATES) } },
    include: { permissions: true },
  })

  for (const role of systemRoles) {
    const wantedKeys = templateFor(role.name) ?? []
    const existing = new Set(role.permissions.map((p) => p.permissionId))
    const toAdd = wantedKeys
      .map((key) => permByKey[key])
      .filter((id) => id && !existing.has(id))
      .map((permissionId) => ({ roleId: role.id, permissionId }))

    if (toAdd.length) {
      await prisma.rolePermission.createMany({ data: toAdd, skipDuplicates: true })
    }
  }
}
