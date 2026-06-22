# TraceChain Backend

API REST de TraceChain, una plataforma SaaS académica para trazabilidad agroalimentaria. El sistema está diseñado para empresas que producen, transforman, almacenan, distribuyen o auditan alimentos y necesitan mantener trazabilidad por lotes, movimientos, inspecciones, auditoría y QR público.

Este repositorio contiene el backend Node.js con Express, Prisma y PostgreSQL.

## Qué problema resuelve

TraceChain permite que una empresa agroalimentaria registre el ciclo de vida de sus lotes: creación, movimientos, transformación, inspecciones, estado sanitario y consulta pública. También permite operar como una plataforma multiempresa, donde un super admin administra organizaciones, planes, usuarios globales, roles, permisos y cupos.

## Funcionalidades principales

- Registro de organizaciones con verificación de correo: la organización y el administrador no se crean hasta confirmar el código enviado por correo.
- Login con JWT y verificación en dos pasos (2FA por código al correo, obligatoria).
- Servicio de correo por Gmail SMTP (Nodemailer) para códigos OTP y notificaciones.
- Multi-tenancy por organización.
- Roles y permisos dinámicos por organización.
- Super admin para administrar toda la plataforma.
- Lotes con estado, cantidad, fechas, trazabilidad y QR.
- Movimientos de lotes con filtros y paginación.
- Auditoría de acciones relevantes.
- Inspecciones con responsable asignado (usuario real), estado de seguimiento (pendiente, en curso, resuelto), detalle de hallazgos y notificación por correo al responsable.
- Inventario de materias primas y proveedores, con consumo de ingredientes trazado hacia el producto terminado (lote).
- Reportes CSV/PDF de lotes y movimientos.
- Dashboard con KPIs, alertas y datos para gráficos.
- Planes con límites y features dinámicos.
- Límites personalizados por organización (`customLimits`) para no depender solo del plan.
- Validación centralizada con mensajes claros para el usuario.
- Documentación Swagger en `/api/docs`.

## Stack

| Área | Tecnología |
|---|---|
| Runtime | Node.js ES Modules |
| API | Express 5 |
| Base de datos | PostgreSQL |
| ORM | Prisma 6 |
| Auth | JWT + bcryptjs |
| Correo | Nodemailer (Gmail SMTP) |
| Validación | Joi |
| Reportes | json2csv + PDFKit |
| QR | qrcode |
| Logs HTTP | morgan |
| Tests | Vitest + Supertest |
| Package manager | pnpm |

## Arquitectura

El backend está organizado por módulos de dominio. Cada módulo separa rutas, controladores, servicios, repositorios y DTOs cuando aplica.

```txt
tracechain-backend/
├── prisma/
│   ├── schema.prisma          # Modelo de datos
│   ├── migrations/            # Migraciones SQL
│   └── seed.js                # Datos iniciales
├── src/
│   ├── config/                # Prisma, Swagger, logger
│   ├── middlewares/           # Auth, validación, errores
│   ├── modules/
│   │   ├── auth/              # Registro con verificación, login y 2FA (OTP)
│   │   ├── organizations/     # Organizaciones y límites
│   │   ├── plans/             # Planes, límites y features base
│   │   ├── roles/             # Roles dinámicos
│   │   ├── permissions/       # Catálogo de permisos
│   │   ├── users/             # Usuarios de org y globales
│   │   ├── lots/              # Lotes y trazabilidad
│   │   ├── movements/         # Movimientos
│   │   ├── inspections/       # Visitas, hallazgos, responsable y estado
│   │   ├── suppliers/         # Proveedores de materias primas
│   │   ├── raw-materials/     # Lotes de materia prima (inventario)
│   │   ├── audit/             # Bitácora
│   │   ├── reports/           # CSV/PDF
│   │   ├── stats/             # KPIs dashboard
│   │   └── qr/                # QR base64
│   ├── shared/                # Helpers, RBAC, planes, auditoría, correo (email/)
│   └── app.js                 # Registro de middlewares y rutas
├── server.js
├── docker-compose.yml
└── package.json
```

## Modelo de negocio

TraceChain funciona como una plataforma multiempresa:

- Una organización representa una empresa cliente.
- Cada organización tiene usuarios, roles, permisos, lotes, movimientos, visitas y auditoría propios.
- Un plan define límites base como `lots`, `users` o `movements`, y features como reportes, analítica o inspecciones.
- Una organización puede tener `customLimits` para modificar sus cupos sin crear un plan nuevo.
- El super admin administra la plataforma completa.

Ejemplo: una empresa puede estar en plan `FREE`, pero el super admin puede asignarle 20 lotes y 5 usuarios temporalmente mediante límites personalizados.

## Auth, roles y permisos

El backend usa JWT. En cada request se carga el contexto del usuario:

- `isSuperAdmin`
- organización actual
- rol asignado
- permisos efectivos
- plan efectivo con límites personalizados aplicados

Tipos de acceso:

| Acceso | Descripción |
|---|---|
| Super Admin | Acceso total a la plataforma |
| ORG_ADMIN | Administración dentro de su organización |
| GERENTE | Gestión operativa amplia |
| OPERARIO | Registro operativo de lotes y movimientos |
| AUDITOR | Lectura, auditoría, inspecciones y reportes |

Los roles son dinámicos y sus permisos se administran desde la UI.

## Validación y errores

El middleware `validate` centraliza validación con Joi y responde errores estructurados:

```json
{
  "status": "error",
  "message": "La cantidad debe ser mayor que cero",
  "details": [
    { "field": "quantity", "message": "La cantidad debe ser mayor que cero" }
  ]
}
```

Esto permite que el frontend muestre mensajes claros al crear o editar lotes, usuarios, organizaciones, movimientos, planes y credenciales.

Reglas importantes:

- Email válido.
- Contraseña fuerte: mínimo 8 caracteres, una mayúscula, una minúscula y un número.
- Slug normalizado a minúsculas y guiones.
- Fechas de lote coherentes.
- Cantidades positivas.
- Límites numéricos enteros.

## Endpoints principales

### Auth `/api/auth`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/register` | Paso 1 del registro: valida datos y envía código al correo (no crea nada todavía) |
| POST | `/register-org` | Alias compatible del paso 1 de registro |
| POST | `/register/verify` | Paso 2: valida el código y recién entonces crea la organización y el administrador |
| POST | `/register/resend` | Reenvía el código de verificación de un registro pendiente |
| POST | `/login` | Paso 1 del login: valida credenciales y envía código 2FA al correo |
| POST | `/verify-otp` | Paso 2 del login: valida el código y devuelve la sesión |
| POST | `/resend-otp` | Reenvía el código 2FA del login |

### Organizaciones `/api/organizations`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista organizaciones, solo super admin |
| POST | `/` | Crea organización, solo super admin |
| GET | `/me` | Datos y uso de la organización actual |
| PATCH | `/me` | Edita datos básicos de la organización actual |
| GET | `/:id` | Detalle de organización |
| PATCH | `/:id` | Edita nombre, slug, plan y límites personalizados |
| PATCH | `/:id/plan` | Cambia plan base |
| PATCH | `/:id/status` | Activa o suspende organización |

### Planes `/api/plans`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista planes |
| GET | `/catalog` | Catálogo de límites, features y periodos |
| POST | `/` | Crea plan |
| PATCH | `/:id` | Edita plan |
| DELETE | `/:id` | Elimina plan si no tiene organizaciones |

### Roles y permisos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/roles` | Lista roles de una organización |
| POST | `/api/roles` | Crea rol |
| PATCH | `/api/roles/:id` | Edita rol |
| PUT | `/api/roles/:id/permissions` | Actualiza permisos del rol |
| PUT | `/api/roles/:id/users` | Asigna usuarios a un rol |
| DELETE | `/api/roles/:id` | Elimina rol sin usuarios |
| GET | `/api/permissions` | Catálogo de permisos agrupados |

### Usuarios `/api/users`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista usuarios de organización o globales con `scope=all` |
| POST | `/` | Crea usuario |
| GET | `/:id` | Obtiene usuario |
| PATCH | `/:id` | Edita nombre, rol, organización o super admin según permisos |
| PATCH | `/:id/password` | Cambia contraseña propia |
| DELETE | `/:id` | Elimina usuario |

### Lotes `/api/lots`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista paginada con filtros |
| POST | `/` | Crea lote |
| GET | `/:id` | Detalle del lote |
| PATCH | `/:id` | Edita lote |
| PATCH | `/:id/status` | Cambia estado |
| GET | `/:id/tree` | Árbol de trazabilidad |
| GET | `/public/:qrCode` | Consulta pública por QR |

### Movimientos `/api/movements`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista paginada con filtros |
| POST | `/` | Crea movimiento |
| GET | `/lot/:lotId` | Movimientos de un lote |

### Inspecciones `/api/inspections`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista inspecciones, con filtros por estado y `mine=true` (mis pendientes) |
| POST | `/` | Crea visita con hallazgos y responsable; notifica por correo al responsable |
| GET | `/:id` | Detalle de inspección con responsable, hallazgos y autor |
| PATCH | `/:id/status` | Cambia el estado de seguimiento (pendiente, en curso, resuelto) |
| GET | `/lot/:lotId` | Inspecciones de un lote |

### Inventario `/api/suppliers` y `/api/raw-materials`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/suppliers` | Lista proveedores de la organización |
| POST | `/api/suppliers` | Crea proveedor |
| PATCH | `/api/suppliers/:id` | Edita proveedor |
| DELETE | `/api/suppliers/:id` | Elimina proveedor |
| GET | `/api/raw-materials` | Lista lotes de materia prima |
| POST | `/api/raw-materials` | Registra lote de materia prima |
| PATCH | `/api/raw-materials/:id` | Edita lote de materia prima |
| DELETE | `/api/raw-materials/:id` | Elimina lote de materia prima |

Al crear un lote (`POST /api/lots`) se puede enviar `supplierId` e `ingredients[]` (materias primas usadas con cantidad), construyendo la trazabilidad de producto a materia prima.

### Auditoría, reportes, QR y stats

| Módulo | Rutas clave |
|---|---|
| Audit | `GET /api/audit`, filtros por acción, usuario, lote y fecha |
| Reports | `GET /api/reports/lots/csv`, `/lots/pdf`, `/movements/csv`, `/movements/pdf` |
| QR | `GET /api/qr/:qrCode` |
| Stats | `GET /api/stats/dashboard` |
| Docs | `GET /api/docs` |

## Variables de entorno

Crear `.env` desde `.env.example`:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/tracechain
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
NODE_ENV=development
PUBLIC_URL=http://localhost:5173
APP_URL=http://localhost:5173

# Correo (Gmail SMTP vía Nodemailer). Sin GMAIL_USER/GMAIL_APP_PASSWORD
# los correos se simulan en consola (útil en desarrollo).
# GMAIL_APP_PASSWORD es una contraseña de aplicación de Google
# (https://myaccount.google.com/apppasswords), no la contraseña normal.
GMAIL_USER=
GMAIL_APP_PASSWORD=
MAIL_FROM=TraceChain <tu-correo@gmail.com>
```

## Instalación local

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

Servidor:

```txt
http://localhost:3000
```

Health check:

```bash
curl http://localhost:3000/health
```

Swagger:

```txt
http://localhost:3000/api/docs
```

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor con `node --watch` |
| `pnpm start` | Servidor en modo producción |
| `pnpm test` | Tests con Vitest |
| `pnpm test:coverage` | Coverage |
| `pnpm prisma:migrate` | Ejecuta migraciones |
| `pnpm prisma:generate` | Regenera Prisma Client |
| `pnpm prisma:studio` | Abre Prisma Studio |
| `pnpm prisma:seed` | Carga datos iniciales |

## Datos iniciales

El seed crea planes base, permisos, roles de sistema y usuarios iniciales para desarrollo. Después de ejecutar `pnpm prisma:seed`, revisar `prisma/seed.js` para credenciales exactas si cambian.

## Notas de desarrollo

- Usar `pnpm`, no `npm`, porque el proyecto declara `devEngines`.
- Después de modificar `schema.prisma`, ejecutar migración y regenerar Prisma Client.
- Si `pnpm prisma generate` falla en Windows por bloqueo del DLL, cerrar procesos Node que usen Prisma y reintentar.
- Los límites efectivos salen de `Organization.customLimits` si existen; si no, se usa `Plan.limits`.
- El super admin puede inspeccionar organizaciones con `?organizationId=`.

