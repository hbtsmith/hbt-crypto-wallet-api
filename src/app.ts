import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './docs/swagger.json'
import categoryRoutes from './routes/category.routes'
import tokenRoutes from './routes/token.routes'
import authRoutes  from './routes/auth.routes'


dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Rota da documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/', (_, res) => res.send('Crypto Portfolio API ✅'))
app.use('/categories', categoryRoutes)
app.use('/tokens', tokenRoutes)
app.use('/auth', authRoutes)

export default app
