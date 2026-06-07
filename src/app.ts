import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import config from './config'
import { AuthRoutes } from './modules/auth/auth.route'
import globalErrorHandler from './utils/globalErrorHandler'
import auth from './middlewares/auth'
import { IssuesRoute } from './modules/issues/issues.route'

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
app.get('/', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    message: 'server is doing its works'
  })
})

//* auth routes
app.use('/api/auth', AuthRoutes)

//* issues routes
app.use('/api/issues', IssuesRoute)

//! test route
app.get(
  '/api/test-role',
  auth('maintainer', 'contributor'),
  (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
      message: 'good'
    })
  }
)

//* 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use(globalErrorHandler)

export default app
