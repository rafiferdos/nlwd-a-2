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
    try {
      const token = req.headers.authorization
      if (!token) throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized')

      const decoded = jwt.verify(token, config.jwt_secret) as JwtPayload
      const userData = pool.query(
        `
          SELECT * FROM users WHERE email=$1

        `,
        [decoded.email]
      )
      if ((await userData).rows.length === 0)
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found')

      const user = (await userData).rows[0]
      if (roles.length && !roles.includes(user.roles))
        throw new AppError(StatusCodes.FORBIDDEN, 'Forbidden')

      req.user = decoded
      next()
    } catch (error) {
      next(error)
    }
  })
}

export default auth
