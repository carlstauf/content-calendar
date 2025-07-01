import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'
const { compare, hash } = bcrypt
import { signUpSchema, signInSchema } from '../schemas/auth.js'
import { addDays } from 'date-fns'

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Sign up
  fastify.post('/signup', async (request, reply) => {
    const data = signUpSchema.parse(request.body)
    
    // Check if user exists
    const existing = await fastify.prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (existing) {
      return reply.status(409).send({ error: 'User already exists' })
    }

    // Create user
    const hashedPassword = await hash(data.password, 10)
    const user = await fastify.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`
      }
    })

    // Create session
    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role
    })

    const session = await fastify.prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: addDays(new Date(), 7)
      }
    })

    reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    })
  })

  // Sign in
  fastify.post('/signin', async (request, reply) => {
    const data = signInSchema.parse(request.body)
    
    // Find user
    const user = await fastify.prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    // Verify password
    const valid = await compare(data.password, user.password)
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    // Clean up old sessions
    await fastify.prisma.session.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() }
      }
    })

    // Create new session
    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role
    })

    await fastify.prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: addDays(new Date(), 7)
      }
    })

    reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    })
  })

  // Sign out
  fastify.post('/signout', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    
    await fastify.prisma.session.delete({
      where: { token }
    })

    reply.send({ success: true })
  })

  // Get current user
  fastify.get('/me', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const user = request.user!
    
    reply.send({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl
    })
  })
}