import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import AppError from '../../utils/AppError'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { authServices } from './auth.service'

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Name, email, and password are strictly required.'
    )

  const result = await authServices.register(req.body)
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    message: 'User registered successfully',
    data: result
  })
})

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Email and password are strictly required.'
    )

  const result = await authServices.login(req.body)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: 'Login successful',
    data: result
  })
})

export const AuthControllers = {
  register: registerUser,
  login: loginUser
}
