import { StatusCodes } from 'http-status-codes'
import { JwtPayload } from 'jsonwebtoken'
import { pool } from '../../db'
import AppError from '../../utils/AppError'
import { ICreateIssuePayload, IIssue } from './issues.interface'

const createIssueIntoDB = async (payload: ICreateIssuePayload) => {
  const insertQuery = `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `
  const values = [
    payload.title,
    payload.description,
    payload.type,
    payload.reporter_id
  ]
  const result = await pool.query(insertQuery, values)

  return result.rows[0]
}

const getAllIssuesFromDB = async (query: Record<string, unknown>) => {
  let baseQuery = 'SELECT * FROM issues'
  const conditions: string[] = []
  const values: unknown[] = []

  if (query.status) {
    values.push(query.status)
    conditions.push(`status = $${values.length}`)
  }
  if (query.type) {
    values.push(query.type)
    conditions.push(`type = $${values.length}`)
  }
  if (conditions.length > 0) {
    baseQuery += ' WHERE ' + conditions.join(' AND ')
  }

  const issueResult = await pool.query(baseQuery, values)
  if (issueResult.rows.length === 0) return []

  const reporterIds = [
    ...new Set(issueResult.rows.map((issue) => issue.reporter_id))
  ]

  const userQuery = 'SELECT id, name, role FROM users WHERE id = ANY($1::int[])'
  const userResult = await pool.query(userQuery, [reporterIds])

  const mergedIssues = issueResult.rows.map((issue) => {
    const matchedReporter = userResult.rows.find(
      (user) => user.id === issue.reporter_id
    )

    return {
      ...issue,
      reporter: matchedReporter
    }
  })

  return mergedIssues
}

const updateIssueIntoDB = async (
  id: number,
  payload: IIssue,
  user: JwtPayload
) => {
  const issueQuery = 'SELECT * FROM issues WHERE id=$1'
  const { rows } = await pool.query(issueQuery, [id])

  if (rows.length === 0)
    throw new AppError(StatusCodes.NOT_FOUND, 'Issue not found')

  const currentIssue = rows[0]

  if (user.role === 'contributor') {
    if (currentIssue.reporter_id !== user.id)
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'You can only update your own issues.'
      )

    if (currentIssue.status !== 'open')
      throw new AppError(
        StatusCodes.CONFLICT,
        'You cannot edit an issue that is already in progress or resolved.'
      )

    if (payload.status && payload.status !== currentIssue.status)
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'Contributors cannot change the workflow status.'
      )
  }

  const updates: string[] = []
  const values: unknown[] = []
  let count = 1

  if (payload.title) {
    updates.push(`title = $${count}`)
    values.push(payload.title)
    count++
  }
  if (payload.description) {
    updates.push(`description = $${count}`)
    values.push(payload.description)
    count++
  }
  if (payload.type) {
    updates.push(`type = $${count}`)
    values.push(payload.type)
    count++
  }

  if (payload.status) {
    updates.push(`status = $${count}`)
    values.push(payload.status)
    count++
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`)

  if (updates.length === 1) return currentIssue

  values.push(id)

  const updateQuery = `
  UPDATE issues 
  SET ${updates.join(', ')} 
  WHERE id = $${count} 
  RETURNING *;
`

  const updatedResult = await pool.query(updateQuery, values)
  return updatedResult.rows[0]
}

const deleteIssueFromDB = async (id: number, user: JwtPayload) => {
  if (user.role !== 'maintainer') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Access Denied. Only maintainers can delete issues.'
    )
  }

  const deleteQuery = 'DELETE FROM issues WHERE id = $1 RETURNING id'
  const { rowCount } = await pool.query(deleteQuery, [id])

  if (rowCount === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Issue not found')
  }

  return null
}

export const IssuesServices = {
  create: createIssueIntoDB,
  getAll: getAllIssuesFromDB,
  update: updateIssueIntoDB,
  delete: deleteIssueFromDB
}
