import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

vi.mock('../../src/modules/auth/auth.repository.js', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
  setUserOtp: vi.fn(),
  clearUserOtp: vi.fn()
}))

// El servicio de correo se simula a consola en tests (sin RESEND_API_KEY).
vi.mock('../../src/shared/email/email.service.js', () => ({
  sendEmail: vi.fn().mockResolvedValue({ simulated: true })
}))

import { register, login } from '../../src/modules/auth/auth.service.js'
import { findUserByEmail, createUser, setUserOtp } from '../../src/modules/auth/auth.repository.js'

describe('auth.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('register', () => {
    it('debe registrar un usuario nuevo', async () => {
      findUserByEmail.mockResolvedValue(null)
      createUser.mockResolvedValue({
        id: '123',
        name: 'Julian',
        email: 'julian@test.com',
        role: 'OPERATOR',
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const result = await register({
        name: 'Julian',
        email: 'julian@test.com',
        password: '123456',
        role: 'OPERATOR'
      })

      expect(result).not.toHaveProperty('password')
      expect(result.email).toBe('julian@test.com')
      expect(createUser).toHaveBeenCalledOnce()
    })

    it('debe lanzar error si el email ya existe', async () => {
      findUserByEmail.mockResolvedValue({ id: '123', email: 'julian@test.com' })

      await expect(
        register({ name: 'Julian', email: 'julian@test.com', password: '123456' })
      ).rejects.toThrow('El email ya está registrado')
    })
  })

  describe('login', () => {
    it('debe enviar un código OTP si las credenciales son correctas (2FA)', async () => {
      const hashed = await bcrypt.hash('123456', 10)
      findUserByEmail.mockResolvedValue({
        id: '123',
        name: 'Julian',
        email: 'julian@test.com',
        role: 'OPERATOR',
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      process.env.JWT_SECRET = 'test_secret'
      process.env.JWT_EXPIRES_IN = '7d'

      const result = await login({ email: 'julian@test.com', password: '123456' })

      // Ahora el login es de dos pasos: no devuelve token, solicita el código.
      expect(result).toEqual({ otpRequired: true, email: 'julian@test.com' })
      expect(result).not.toHaveProperty('token')
      expect(setUserOtp).toHaveBeenCalledOnce()
    })

    it('debe lanzar error si el usuario no existe', async () => {
      findUserByEmail.mockResolvedValue(null)

      await expect(
        login({ email: 'noexiste@test.com', password: '123456' })
      ).rejects.toThrow('Credenciales inválidas')
    })

    it('debe lanzar error si la contraseña es incorrecta', async () => {
      const hashed = await bcrypt.hash('correcta', 10)
      findUserByEmail.mockResolvedValue({
        id: '123',
        email: 'julian@test.com',
        password: hashed
      })

      await expect(
        login({ email: 'julian@test.com', password: 'incorrecta' })
      ).rejects.toThrow('Credenciales inválidas')
    })
  })
})