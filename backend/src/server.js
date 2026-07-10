import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import router from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3001

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS bloqueado para origem: ${origin}`))
    }
  },
  credentials: true,
}))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', router)

app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🥋 ASDOKS API rodando em http://localhost:${PORT}`)
  console.log(`📋 Ambiente: ${process.env.NODE_ENV || 'development'}`)
})