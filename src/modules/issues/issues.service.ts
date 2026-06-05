import { ICreateIssuePayload } from './issues.interface'
import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { pool } from '../../db';

const createIssueIntoDB = async (payload: ICreateIssuePayload) => {
  const insertQuery = `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [
    payload.title,
    payload.description,
    payload.type,
    payload.reporter_id,
  ];
  const result = await pool.query(insertQuery, values)

  return result.rows[0]
}

export const IssuesServices = {
  create: createIssueIntoDB
}