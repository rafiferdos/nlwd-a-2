import { Router } from 'express'
import auth from '../../middlewares/auth'
import { IssuesController } from './issues.controller'

const router = Router()

router.post('/', auth(), IssuesController.create)
router.get('/', IssuesController.getAll)
router.get('/:id', IssuesController.getSingle)
router.patch('/:id', auth('contributor', 'maintainer'), IssuesController.update)
router.delete('/:id', auth(), IssuesController.delete)

export const IssuesRoute = router
