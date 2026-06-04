import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import config from './config'
import globalErrorHandler from './utils/globalErrorHandler'

const app: Application = express()

app.use(cookieParser())
app.use(express.json())
app.use(
  cors({
    origin: config.allowed_origin as string | '*',
    credentials: true
  })
)

//basic home route
app.use('/', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    message: 'server is doing its works'
  })
})

app.use(globalErrorHandler)

export default app
