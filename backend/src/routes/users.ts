import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional()
})

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all users (admin only)
  fastify.get('/', {
    onRequest: [fastify.authorize(['admin'])]
  }, async (request, reply) => {
    const users = await fastify.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    reply.send(users)
  })

  // Get user by ID
  fastify.get('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const user = await fastify.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      }
    })

    if (!user) {
      return reply.status(404).send({ error: 'User not found' })
    }

    reply.send(user)
  })

  // Update current user
  fastify.patch('/me', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const data = updateUserSchema.parse(request.body)
    const userId = request.user!.id

    const updated = await fastify.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true
      }
    })

    reply.send(updated)
  })

  // Update user role (admin only)
  fastify.patch('/:id/role', {
    onRequest: [fastify.authorize(['admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { role } = z.object({ 
      role: z.enum(['admin', 'editor', 'viewer']) 
    }).parse(request.body)

    const updated = await fastify.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true
      }
    })

    reply.send(updated)
  })
}