import bcrypt from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
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

  const userData = await pool.query(
    `
      SELECT * FROM users WHERE email=$1
    `
  )
  if (userData.rows.length === 0)
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid things entered')
}

export const userService = {
  register: registerIntoDB,
  login: loginIntoDB
}
