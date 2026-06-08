import bcrypt from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import config from '../../config'
import { pool } from '../../db'
import AppError from '../../utils/AppError'
import { IUser } from './auth.interface'

const registerIntoDB = async (userData: IUser) => {
  const { name, email, password, role } = userData
  if (!password)
    throw new AppError(StatusCodes.FORBIDDEN, 'Password is required')

  const hashedPassword = await bcrypt.hash(password, 10)

  const result = await pool.query(
    `
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *;
    `,
    [name, email, hashedPassword, role || 'contributor']
  )

  const newUser = result.rows[0]
  delete newUser.password

  return newUser
}

const loginIntoDB = async (payload: { email: string; password: string }) => {
  const { email, password } = payload

  const result = await pool.query(
    `
      SELECT * FROM users WHERE email=$1
    `,
    [email]
  )

  const user = result.rows[0]
  if (!user)
    throw new AppError(StatusCodes.UNAUTHORIZED, 'User does not exists')

  const isPasswordValidated = await bcrypt.compare(password, user.password)
  if (!isPasswordValidated)
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Wrong Credentials')

  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  }

  delete user.password
  const accessToken = jwt.sign(jwtPayload, config.jwt_secret)
  return { token: accessToken, user }
}

export const authServices = {
  register: registerIntoDB,
  login: loginIntoDB
}
