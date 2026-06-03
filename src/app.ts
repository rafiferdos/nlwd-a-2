import cookieParser from "cookie-parser";
import express, { Application } from "express";
import cors from 'cors'

const app: Application = express()

app.use(cookieParser())
app.use(express.json())
app.use(cors({
  origin: '*',
  credentials: true
}))

export default app