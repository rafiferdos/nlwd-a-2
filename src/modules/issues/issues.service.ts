import { pool } from '../../db'
import { ICreateIssuePayload } from './issues.interface'

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

export const IssuesServices = {
  create: createIssueIntoDB,
  getAll: getAllIssuesFromDB
}
