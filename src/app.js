import express from 'express'
import morgan from 'morgan'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use(errorHandler)

export default app


