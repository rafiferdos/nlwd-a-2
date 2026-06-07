import { Router } from "express";
import { IssuesController } from "./issues.controller";
import auth from "../../middlewares/auth";

const router = Router()

router.post('/', auth(), IssuesController.create)
router.get('/', auth(), IssuesController.getAll)

export const IssuesRoute = router