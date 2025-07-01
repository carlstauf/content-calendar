import { FastifyPluginAsync } from 'fastify'
import { createCommentSchema, updateCommentSchema } from '../schemas/comment.js'
import { extractMentions } from '../utils/mentions.js'
import { sendMentionNotification } from '../services/notifications.js'

export const commentRoutes: FastifyPluginAsync = async (fastify) => {
  // Create comment
  fastify.post('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const data = createCommentSchema.parse(request.body)
    const userId = request.user!.id

    // Verify post exists
    const post = await fastify.prisma.post.findUnique({
      where: { id: data.postId }
    })

    if (!post) {
      return reply.status(404).send({ error: 'Post not found' })
    }

    // Create comment
    const comment = await fastify.prisma.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    })

    // Extract and create mentions
    const usernames = extractMentions(data.content)
    if (usernames.length > 0) {
      const mentionedUsers = await fastify.prisma.user.findMany({
        where: {
          name: { in: usernames }
        }
      })

      // Create mention records
      await fastify.prisma.mention.createMany({
        data: mentionedUsers.map(user => ({
          commentId: comment.id,
          userId: user.id
        }))
      })

      // Send notifications
      for (const user of mentionedUsers) {
        await sendMentionNotification({
          user,
          comment,
          post,
          author: request.user!
        })
      }
    }

    reply.status(201).send(comment)
  })

  // Update comment
  fastify.patch('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = updateCommentSchema.parse(request.body)
    const userId = request.user!.id

    // Verify ownership
    const existing = await fastify.prisma.comment.findUnique({
      where: { id }
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Comment not found' })
    }

    if (existing.authorId !== userId && request.user!.role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden' })
    }

    // Update comment
    const comment = await fastify.prisma.comment.update({
      where: { id },
      data: {
        content: data.content,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    })

    reply.send(comment)
  })

  // Delete comment
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.user!.id

    // Verify ownership
    const comment = await fastify.prisma.comment.findUnique({
      where: { id }
    })

    if (!comment) {
      return reply.status(404).send({ error: 'Comment not found' })
    }

    if (comment.authorId !== userId && request.user!.role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden' })
    }

    await fastify.prisma.comment.delete({
      where: { id }
    })

    reply.status(204).send()
  })
}