import express from 'express'
import morgan from 'morgan'
import { errorHandler } from './middlewares/errorHandler.js'
import authRoutes from './modules/auth/auth.routes.js'
import lotRoutes from './modules/lots/lot.routes.js'
import movementRoutes from './modules/movements/movement.routes.js'
import qrRoutes from './modules/qr/qr.routes.js'
import auditRoutes from './modules/audit/audit.routes.js'
import userRoutes from './modules/users/users.routes.js'
import statsRoutes from './modules/stats/stats.routes.js'
import inspectionRoutes from './modules/inspections/inspections.routes.js'
import reportRoutes from './modules/reports/report.routes.js'

const app = express()

app.use(express.json())
app.use(morgan('dev'))

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
app.use(errorHandler)

export default app


