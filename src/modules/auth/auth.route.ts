import { Router } from 'express'
import { AuthControllers } from './auth.controller'

const router = Router()

router.post('/signup', AuthControllers.register)
router.post('/login', AuthControllers.login)

export const AuthRoutes = router
