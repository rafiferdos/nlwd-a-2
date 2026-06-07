import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import AppError from '../../utils/AppError'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { IssuesServices } from './issues.service'

const createIssue = catchAsync(async (req: Request, res: Response) => {
  const { title, description, type } = req.body
  const reporter_id = req.user.id

  if (!title || title.length > 150)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Title is required and must be maximum 150 characters.'
    )
  if (!description || description.length < 20)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Description is required and must be minimum 20 characters.'
    )
  if (type !== 'bug' && type !== 'feature_request') {
    throw new AppError(
      400,
      'Type must be strictly either "bug" or "feature_request".'
    )
  }
  const payload = {
    title,
    description,
    type,
    reporter_id
  }
  const result = await IssuesServices.create(payload)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: 'Issue created successfully',
    data: result
  })
})

const getAllIssue = catchAsync(async (req: Request, res: Response) => {
  const { status, type } = req.query

  if (status && !['open', 'in_progress', 'resolved'].includes(status as string))
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Invalid status query. Must be open, in_progress, or resolved.'
    )

  if (type && !['bug', 'feature_request'].includes(type as string))
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Invalid type query. Must be bug or feature_request.'
    )

  const result = await IssuesServices.getAll(req.query)
  
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: 'Issues retrieved successfully',
    data: result
  })
})

export const IssuesController = {
  create: createIssue,
  getAll: getAllIssue
}
