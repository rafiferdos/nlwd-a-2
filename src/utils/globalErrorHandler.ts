import type { ErrorRequestHandler } from 'express'
import { z, ZodError } from 'zod'
import AppError from './AppError.js'
import sendResponse from './sendResponse.js'

const isDev = process.env.NODE_ENV !== 'production'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Zod validation error
  if (err instanceof ZodError) {
    sendResponse(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors: z.treeifyError(err)
    })
    return
  }

  // Custom operational error (তুই throw করেছিস intentionally)
  if (err instanceof AppError) {
    sendResponse(res, {
      statusCode: err.statusCode,
      message: err.message
    })
    return
  }

  // Prisma / DB errors (PERN project তো)
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string'
  ) {
    const code = (err as { code: string }).code

    if (code === 'P2002') {
      sendResponse(res, {
        statusCode: 409,
        message: 'Duplicate entry — resource already exists'
      })
      return
    }

    if (code === 'P2025') {
      sendResponse(res, {
        statusCode: 404,
        message: 'Record not found'
      })
      return
    }
  }

  // Unknown / programmer errors
  const message = err instanceof Error ? err.message : 'Internal server error'

  // Dev: stack দেখা যাবে, Prod: শুধু generic message
  sendResponse(res, {
    statusCode: 500,
    message: isDev ? message : 'Something went wrong',
    ...(isDev && { errors: { stack: err instanceof Error ? err.stack : err } })
  })
}

export default globalErrorHandler
