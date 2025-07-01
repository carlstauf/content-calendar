import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { build } from './helper.js'
import { FastifyInstance } from 'fastify'

describe('Auth Routes', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await build()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('token')
      expect(body.user).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
        role: 'editor'
      })
    })

    it('should reject duplicate emails', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Another User'
        }
      })

      expect(response.statusCode).toBe(409)
    })

    it('should validate input', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'invalid-email',
          password: 'short',
          name: 'A'
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })
  })

  describe('POST /api/auth/signin', () => {
    it('should authenticate valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signin',
        payload: {
          email: 'test@example.com',
          password: 'password123'
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('token')
      expect(body.user.email).toBe('test@example.com')
    })

    it('should reject invalid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signin',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      })

      expect(response.statusCode).toBe(401)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      // First sign in
      const signInResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signin',
        payload: {
          email: 'test@example.com',
          password: 'password123'
        }
      })

      const { token } = JSON.parse(signInResponse.body)

      // Get current user
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.email).toBe('test@example.com')
    })

    it('should reject unauthenticated requests', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me'
      })

      expect(response.statusCode).toBe(401)
    })
  })
})