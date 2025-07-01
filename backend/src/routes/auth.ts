import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { addDays } from 'date-fns'

// Simple login by name schema
const loginSchema = z.object({ name: z.string().min(1) })

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Simple login by name
  fastify.post('/login', async (request, reply) => {
    const { name } = loginSchema.parse(request.body)
    
    // Find or create user by name
    let user = await fastify.prisma.user.findUnique({
      where: { name }
    })
    
    if (!user) {
      // Create new user with just a name
      user = await fastify.prisma.user.create({
        data: {
          name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@placeholder.local`,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        }
      })
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