import { FastifyPluginAsync } from 'fastify'
import { createPostSchema, updatePostSchema, postQuerySchema, bulkActionSchema } from '../schemas/post.js'
import { Status } from '@prisma/client'

export const postRoutes: FastifyPluginAsync = async (fastify) => {
  // Get posts with filters
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const query = postQuerySchema.parse(request.query)
    const { page, limit, day, ...filters } = query

    const where: any = {}
    
    // Handle day filter with date range
    if (day) {
      where.publishDate = {
        gte: new Date(`${day}T00:00:00.000Z`),
        lt: new Date(`${day}T23:59:59.999Z`)
      }
      where.status = 'Scheduled' // only scheduled posts for day view
    } else {
      where.status = filters.status || 'Scheduled' // default to scheduled
    }
    
    if (filters.platform) where.platform = filters.platform
    if (filters.pillar) where.pillar = filters.pillar
    if (filters.assigneeId) where.assigneeId = filters.assigneeId
    
    if (!day && (filters.startDate || filters.endDate)) {
      where.publishDate = {}
      if (filters.startDate) where.publishDate.gte = new Date(filters.startDate)
      if (filters.endDate) where.publishDate.lte = new Date(filters.endDate)
    }

    const [posts, total] = await Promise.all([
      fastify.prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          },
          _count: {
            select: {
              comments: true,
              attachments: true
            }
          }
        },
        orderBy: { publishDate: 'asc' }
      }),
      fastify.prisma.post.count({ where })
    ])

    reply.send({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  })

  // Get single post
  fastify.get('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const post = await fastify.prisma.post.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            },
            mentions: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        attachments: true
      }
    })

    if (!post) {
      return reply.status(404).send({ error: 'Post not found' })
    }

    reply.send(post)
  })

  // Create post
  fastify.post('/', {
    onRequest: [fastify.authorize(['admin', 'editor'])]
  }, async (request, reply) => {
    const data = createPostSchema.parse(request.body)
    
    // Auto-publish if date is in the past
    const publishDate = new Date(data.publishDate)
    const status = data.status || (publishDate < new Date() ? Status.Published : Status.Scheduled)

    const post = await fastify.prisma.post.create({
      data: {
        ...data,
        status,
        publishDate
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    })

    reply.status(201).send(post)
  })

  // Update post
  fastify.patch('/:id', {
    onRequest: [fastify.authorize(['admin', 'editor'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = updatePostSchema.parse(request.body)

    const post = await fastify.prisma.post.update({
      where: { id },
      data: {
        ...data,
        publishDate: data.publishDate ? new Date(data.publishDate) : undefined
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    })

    reply.send(post)
  })

  // Delete post
  fastify.delete('/:id', {
    onRequest: [fastify.authorize(['admin', 'editor'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    
    await fastify.prisma.post.delete({
      where: { id }
    })

    reply.status(204).send()
  })

  // Bulk actions
  fastify.post('/bulk', {
    onRequest: [fastify.authorize(['admin', 'editor'])]
  }, async (request, reply) => {
    const { postIds, action, data } = bulkActionSchema.parse(request.body)

    switch (action) {
      case 'delete':
        await fastify.prisma.post.deleteMany({
          where: { id: { in: postIds } }
        })
        break

      case 'publish':
        await fastify.prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { status: Status.Published }
        })
        break

      case 'draft':
        await fastify.prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { status: Status.Draft }
        })
        break

      case 'reschedule':
        if (!data?.publishDate) {
          return reply.status(400).send({ error: 'publishDate required for reschedule' })
        }
        await fastify.prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { 
            publishDate: new Date(data.publishDate),
            status: Status.Scheduled
          }
        })
        break
    }

    reply.send({ success: true, affected: postIds.length })
  })

  // Analytics
  fastify.get('/analytics/summary', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const [byStatus, byPlatform, byPillar, thisMonth] = await Promise.all([
      fastify.prisma.post.groupBy({
        by: ['status'],
        _count: true
      }),
      fastify.prisma.post.groupBy({
        by: ['platform'],
        _count: true,
        where: { status: Status.Published }
      }),
      fastify.prisma.post.groupBy({
        by: ['pillar'],
        _count: true,
        where: { status: Status.Published }
      }),
      fastify.prisma.post.count({
        where: {
          publishDate: { gte: startOfMonth },
          status: Status.Published
        }
      })
    ])

    reply.send({
      byStatus: byStatus.reduce((acc, item) => ({
        ...acc,
        [item.status]: item._count
      }), {}),
      byPlatform: byPlatform.reduce((acc, item) => ({
        ...acc,
        [item.platform]: item._count
      }), {}),
      byPillar: byPillar.reduce((acc, item) => ({
        ...acc,
        [item.pillar]: item._count
      }), {}),
      thisMonth
    })
  })
}