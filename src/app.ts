import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application } from 'express'
import config from './config'

const app: Application = express()

app.use(cookieParser())
app.use(express.json())
app.use(
  cors({
    origin: config.allowed_origin as string | '*',
    credentials: true
  })
)

export default app
