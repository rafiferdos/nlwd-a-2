import { Router } from "express";
import { IssuesController } from "./issues.controller";
import auth from "../../middlewares/auth";

const router = Router()

router.post('/', auth('contributor'), IssuesController.create)

export const IssuesRoute = router