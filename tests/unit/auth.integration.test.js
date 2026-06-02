import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'
import prisma from '../../src/config/db.js'

beforeAll(async () => {
  await prisma.auditLog.deleteMany()
  await prisma.movement.deleteMany()
  await prisma.lot.deleteMany()
  await prisma.user.deleteMany({ where: { email: 'test_integration@test.com' } })
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: 'test_integration@test.com' } })
  await prisma.$disconnect()
})

describe('POST /api/auth/register', () => {
  it('debe registrar un usuario correctamente', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test_integration@test.com',
        password: '123456'
      })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('success')
    expect(res.body.data).not.toHaveProperty('password')
    expect(res.body.data.email).toBe('test_integration@test.com')
  })

  it('debe rechazar email duplicado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test_integration@test.com',
        password: '123456'
      })

    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
  })
})

describe('POST /api/auth/login', () => {
  it('debe hacer login correctamente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test_integration@test.com',
        password: '123456'
      })

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('token')
  })

  it('debe rechazar credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test_integration@test.com',
        password: 'incorrecta'
      })

    expect(res.status).toBe(401)
  })
})