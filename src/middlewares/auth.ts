import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from '../config'
import { pool } from '../db'
import { TUserRole } from '../modules/auth/auth.interface'
import AppError from '../utils/AppError'
import catchAsync from '../utils/catchAsync'

const auth = (...roles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // console.log(roles)
    // console.log(req.headers.authorization)
    const authHeader = req.headers.authorization
    if (!authHeader) throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized')

    // Handle token with or without 'Bearer ' prefix
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader

    const decoded = jwt.verify(token, config.jwt_secret) as JwtPayload
    const result = await pool.query(
      `
          SELECT * FROM users WHERE id=$1
        `,
      [decoded.id]
    )
    if (result.rows.length === 0)
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found')

    const user = result.rows[0]
    if (roles.length && !roles.includes(user.role))
      throw new AppError(StatusCodes.FORBIDDEN, 'Forbidden')

    req.user = decoded
    next()
  })
}

export default auth
