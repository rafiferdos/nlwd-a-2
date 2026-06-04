import { StatusCodes } from 'http-status-codes';
import { pool } from '../../db'
import AppError from '../../utils/AppError';

const loginIntoDB = async (payload: { email: string; password: string }) => {
  const { email, password } = payload

  const userData = await pool.query(
    `
      SELECT * FROM users WHERE email=$1
    `
  )
  if (userData.rows.length === 0) throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid things entered')
  
}
