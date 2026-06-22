import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import {
  PERMISSIONS,
  ALL_PERMISSION_KEYS,
  SUPER_ADMIN_ROLE_NAME,
  OWNER_ROLE_NAME,
  seedOrganizationRoles,
  syncSystemRolePermissions,
} from '../src/shared/rbac.js'

const prisma = new PrismaClient()

const PLANS = [
  {
    key: 'FREE',
    name: 'Free',
    description: 'Para empezar: hasta 10 lotes y lo esencial de trazabilidad.',
    price: 0,
    sortOrder: 0,
    limits: { lots: 10, users: 3 },
    features: { reports: false, advancedMovements: false, inspections: false, analytics: false },
  },
  {
    key: 'PRO',
    name: 'Pro',
    description: 'Para operaciones en crecimiento: reportes, inspecciones y más volumen.',
    price: 49,
    sortOrder: 1,
    limits: { lots: 1000, users: 50 },
    features: { reports: true, advancedMovements: true, inspections: true, analytics: true },
  },
]

async function main() {
  // 1. Planes
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { key: plan.key },
      update: {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        sortOrder: plan.sortOrder,
        limits: plan.limits,
        features: plan.features,
      },
      create: plan,
    })
  }
  const freePlan = await prisma.plan.findUnique({ where: { key: 'FREE' } })

  // 2. Catálogo de permisos
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { module: perm.module, action: perm.action, label: perm.label },
      create: perm,
    })
  }
  const permissions = await prisma.permission.findMany()
  const permByKey = Object.fromEntries(permissions.map((p) => [p.key, p.id]))

  // 2b. Propaga permisos nuevos a los roles de sistema de organizaciones ya existentes.
  await syncSystemRolePermissions(prisma)

  // 3. Rol global SUPER_ADMIN (sin organización) — rol de sistema (no usado para permisos, sí para display)
  let superRole = await prisma.role.findFirst({
    where: { organizationId: null, name: SUPER_ADMIN_ROLE_NAME },
  })
  if (!superRole) {
    superRole = await prisma.role.create({
      data: {
        name: SUPER_ADMIN_ROLE_NAME,
        description: 'Administrador de la plataforma (dueño del producto).',
        isSystem: true,
        organizationId: null,
        permissions: {
          create: ALL_PERMISSION_KEYS.map((key) => ({ permissionId: permByKey[key] })),
        },
      },
    })
  }

  // 3b. Organización de la plataforma "TraceChain" (plan PRO, para el super admin)
  const proPlan = await prisma.plan.findUnique({ where: { key: 'PRO' } })
  let platformOrg = await prisma.organization.findUnique({ where: { slug: 'tracechain' } })
  if (!platformOrg) {
    platformOrg = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: 'TraceChain', slug: 'tracechain', planId: proPlan.id },
      })
      await seedOrganizationRoles(tx, org.id)
      return org
    })
  }

  const platformAdminRole = await prisma.role.findUnique({
    where: { organizationId_name: { organizationId: platformOrg.id, name: OWNER_ROLE_NAME } },
  })

  const superPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@tracechain.com' },
    update: { isSuperAdmin: true, roleId: platformAdminRole.id, organizationId: platformOrg.id },
    create: {
      name: 'Super Admin',
      email: 'admin@tracechain.com',
      password: superPassword,
      isSuperAdmin: true,
      roleId: platformAdminRole.id,
      organizationId: platformOrg.id,
    },
  })

  // 4. Organización demo con plan FREE + roles clonados (idempotente)
  let demoOrg = await prisma.organization.findUnique({ where: { slug: 'demo' } })
  if (!demoOrg) {
    demoOrg = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: 'Organización Demo', slug: 'demo', planId: freePlan.id },
      })
      await seedOrganizationRoles(tx, org.id)
      return org
    })
  }

  const orgAdminRole = await prisma.role.findUnique({
    where: { organizationId_name: { organizationId: demoOrg.id, name: OWNER_ROLE_NAME } },
  })

  const demoAdminPassword = await bcrypt.hash('demo123', 10)
  const demoAdmin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: { roleId: orgAdminRole.id, organizationId: demoOrg.id },
    create: {
      name: 'Admin Demo',
      email: 'admin@demo.com',
      password: demoAdminPassword,
      organizationId: demoOrg.id,
      roleId: orgAdminRole.id,
    },
  })

  // 5. Datos de ejemplo DENTRO de la organización demo
  const lot1 = await prisma.lot.upsert({
    where: { code: 'LOT-SEED-001' },
    update: {},
    create: {
      code: 'LOT-SEED-001',
      qrCode: uuidv4(),
      name: 'Lote Mango Premium',
      quantity: 500,
      unit: 'kg',
      status: 'ACTIVE',
      productionDate: new Date('2026-06-01'),
      expirationDate: new Date('2026-06-15'),
      sanitaryRecord: 'SAN-2026-001',
      storageTemp: 8.5,
      storageHumidity: 75,
      notes: 'Lote de prueba seed',
      organizationId: demoOrg.id,
      createdById: demoAdmin.id,
    },
  })

  await prisma.lot.upsert({
    where: { code: 'LOT-SEED-002' },
    update: {},
    create: {
      code: 'LOT-SEED-002',
      qrCode: uuidv4(),
      name: 'Lote Mango Fraccionado',
      quantity: 200,
      unit: 'kg',
      status: 'ACTIVE',
      productionDate: new Date('2026-06-01'),
      expirationDate: new Date('2026-06-15'),
      parentLotId: lot1.id,
      organizationId: demoOrg.id,
      createdById: demoAdmin.id,
    },
  })

  await prisma.movement.create({
    data: {
      type: 'TRANSFERRED',
      description: 'Traslado de bodega principal a distribución',
      quantity: 200,
      fromLocation: 'Bodega Principal',
      toLocation: 'Bodega Distribución',
      organizationId: demoOrg.id,
      lotId: lot1.id,
      createdById: demoAdmin.id,
    },
  })

  console.log('Seed ejecutado correctamente')
  console.log('  Super admin:  admin@tracechain.com / admin123')
  console.log('  Org demo admin: admin@demo.com / demo123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
