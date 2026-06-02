import { Router } from 'express'
import { registerController, loginController } from './auth.controller.js'
import { validate } from '../../middlewares/validate.js'
import { registerDto, loginDto } from './auth.dto.js'

const router = Router()

router.post('/register', validate(registerDto), registerController)
router.post('/login', validate(loginDto), loginController)

export default router