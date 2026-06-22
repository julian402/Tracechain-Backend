import { Router } from 'express'
import { registerController, verifyRegistrationController, resendRegistrationController, loginController, verifyOtpController, resendOtpController, meController } from './auth.controller.js'
import { authenticate } from '../../middlewares/auth.js'
import { validate } from '../../middlewares/validate.js'
import { registerOrgDto, loginDto, verifyOtpDto, resendOtpDto } from './auth.dto.js'

const router = Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar una organización y su administrador
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organizationName, name, email, password]
 *             properties:
 *               organizationName:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organización y administrador creados con sesión iniciada
 *       400:
 *         description: Email ya registrado
 */
router.post('/register', validate(registerOrgDto), registerController)
router.post('/register-org', validate(registerOrgDto), registerController)
router.post('/register/verify', validate(verifyOtpDto), verifyRegistrationController)
router.post('/register/resend', validate(resendOtpDto), resendRegistrationController)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso con token JWT, permisos y organización
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', validate(loginDto), loginController)
router.post('/verify-otp', validate(verifyOtpDto), verifyOtpController)
router.post('/resend-otp', validate(resendOtpDto), resendOtpController)
router.get('/me', authenticate, meController)

export default router
