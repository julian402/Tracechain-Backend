import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { errorHandler } from './middlewares/errorHandler.js'
import { corsOptions, notFoundHandler, securityHeaders } from './middlewares/security.js'
import authRoutes from './modules/auth/auth.routes.js'
import lotRoutes from './modules/lots/lot.routes.js'
import movementRoutes from './modules/movements/movement.routes.js'
import qrRoutes from './modules/qr/qr.routes.js'
import auditRoutes from './modules/audit/audit.routes.js'
import userRoutes from './modules/users/users.routes.js'
import statsRoutes from './modules/stats/stats.routes.js'
import inspectionRoutes from './modules/inspections/inspections.routes.js'
import reportRoutes from './modules/reports/report.routes.js'
import planRoutes from './modules/plans/plans.routes.js'
import organizationRoutes from './modules/organizations/organizations.routes.js'
import roleRoutes from './modules/roles/roles.routes.js'
import permissionRoutes from './modules/permissions/permissions.routes.js'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.js'

const app = express()

app.disable('x-powered-by')
app.use(securityHeaders)
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))
app.use(cors(corsOptions))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})
app.use('/api/auth', authRoutes)
app.use('/api/lots', lotRoutes)
app.use('/api/movements', movementRoutes)
app.use('/api/qr', qrRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/users', userRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/inspections', inspectionRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/plans', planRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/permissions', permissionRoutes)

const docsEnabled = process.env.API_DOCS_ENABLED === 'true' || process.env.NODE_ENV !== 'production'
if (docsEnabled) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

app.use(notFoundHandler)
app.use(errorHandler)

export default app


