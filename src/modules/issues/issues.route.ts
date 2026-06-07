import { Router } from "express";
import { IssuesController } from "./issues.controller";
import auth from "../../middlewares/auth";

const router = Router()

router.post('/', auth(), IssuesController.create)
router.get('/', auth(), IssuesController.getAll)
router.patch('/:id', auth('contributor', 'maintainer'), IssuesController.update)

export const IssuesRoute = router