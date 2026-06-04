import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../utils/catchAsync'
import { authServices } from './auth.service'

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body

  if (!name || !email || !password)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation Error',
      errors: 'Name, email, and password are strictly required.'
    })
  
  const result = await authServices.register(req.body)
  
})
