# TraceChain — Backend Architecture

## What is this project

REST API backend for an agroalimentary traceability system. It allows tracking product lots across the supply chain: creation, transformations (splits/merges), movements, and distribution. Each lot generates a unique QR code that links to a public endpoint with its full history.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v20+ (ES Modules, `"type": "module"`) |
| Framework | Express.js |
| Database | PostgreSQL via **Prisma ORM** |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| Validation | Joi (input DTOs) |
| QR | `qrcode` |
| Logging | Winston + Morgan |
| Package manager | pnpm |
| Env vars | Node native `--env-file=.env` (no dotenv package) |
| Dev server | `node --watch` (no nodemon) |

## Architecture pattern

**MVC + Service Layer + Repository + DTOs**

```
Request → Router → Controller → Service → Repository → PostgreSQL
                      ↑ DTOs in          ↑ Prisma out
```

- **Router**: defines endpoints and applies middlewares (auth, validation)
- **Controller**: receives request, calls service, returns response. No business logic.
- **Service**: all business logic lives here (lot parent-child, audit log, QR generation, traceability rules)
- **Repository**: abstracts all Prisma calls. Services never touch Prisma directly.
- **DTOs**: Joi schemas that validate input shape. Output is filtered in the repository before returning to the controller (e.g. public QR view vs internal view).

## Folder structure

```
tracechain-backend/
├── prisma/
│   ├── schema.prisma         # database schema — source of truth
│   └── seed.js               # seed data
├── src/
│   ├── config/
│   │   ├── db.js             # PrismaClient singleton
│   │   └── logger.js         # Winston logger
│   ├── middlewares/
│   │   ├── auth.js           # JWT verification
│   │   ├── validate.js       # Joi DTO validation
│   │   └── errorHandler.js   # global error handler
│   ├── modules/              # one folder per domain
│   │   ├── auth/             # login, register, tokens
│   │   ├── lots/             # core domain — lot CRUD, parent-child logic
│   │   ├── movements/        # lot movement events
│   │   ├── qr/               # QR generation + public endpoint
│   │   ├── audit/            # read-only audit log (bitácora)
│   │   └── users/            # user management and roles
│   ├── shared/
│   │   ├── AppError.js       # custom error class
│   │   └── response.helper.js
│   └── app.js                # Express setup, mounts all routers
├── tests/
│   ├── unit/
│   └── integration/
├── server.js                 # entry point — starts the server
├── .env                      # local env vars (not in repo)
├── .env.example              # template (in repo)
└── package.json
```

Each module follows this internal structure:
```
modules/lots/
├── lot.controller.js   # req/res only
├── lot.service.js      # business logic
├── lot.repository.js   # Prisma calls
├── lot.routes.js       # Express router
└── lot.dto.js          # Joi schemas
```

## Key domain concepts

- **Lot**: core entity. Has a unique ID, status (active/expired/quarantine), quantity, dates, and sanitary record.
- **Derived lot**: when a lot is split or merged, the system creates child lots linked to the parent via a `parentLotId` relation in Prisma. This allows full forward/backward traceability.
- **Movement**: any event on a lot (transfer, transformation, storage change). Immutable — only created, never updated or deleted.
- **Audit log**: every write action records who did it, when, and what changed. Append-only.
- **Public QR view**: a filtered read-only endpoint (`GET /public/lots/:qrCode`) that shows safe external info without internal IDs or sensitive data.

## Auth

- JWT tokens, signed with `JWT_SECRET`
- Passwords hashed with bcrypt
- Role-based access control (RBAC): roles enforced in middleware before reaching controllers
- Public endpoints (QR view) require no token

## Error handling

All errors go through a centralized `errorHandler` middleware. Services throw `AppError` instances with a `statusCode`. The handler formats the response consistently:

```json
{ "status": "error", "message": "..." }
```

## Environment variables

```
PORT                  # server port (default 3000)
DATABASE_URL          # postgresql://user:pass@host:5432/tracechain
JWT_SECRET            # signing secret
JWT_EXPIRES_IN        # e.g. 7d
NODE_ENV              # development | production
```

Loaded natively: `node --env-file=.env server.js`

## Scripts

```bash
pnpm dev                        # node --watch --env-file=.env server.js
pnpm start                      # node --env-file=.env server.js
pnpm prisma:migrate             # npx prisma migrate dev
pnpm prisma:studio              # npx prisma studio (visual DB browser)
pnpm prisma:generate            # npx prisma generate (after schema changes)
```

## Database principles

- Prisma ORM as the data access layer — schema defined in `prisma/schema.prisma`
- All Prisma calls isolated in repository layer — services never import PrismaClient directly
- Prisma transactions used for any multi-table write (e.g. creating a derived lot + logging the movement)
- For complex recursive queries (e.g. full lot ancestry tree), use `prisma.$queryRaw`
- Append-only pattern for movements and audit log (no update/delete on those tables)
- Migrations managed with `prisma migrate dev` — never edit the DB manually