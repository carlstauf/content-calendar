import Fastify from 'fastify'
import { authPlugin } from '../plugins/auth.js'
import { prismaPlugin } from '../plugins/prisma.js'
import { errorHandler } from '../plugins/error-handler.js'
import { authRoutes } from '../routes/auth.js'
import { postRoutes } from '../routes/posts.js'
import { commentRoutes } from '../routes/comments.js'
import { userRoutes } from '../routes/users.js'

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing-only-32-chars'
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/content_calendar_test'

export async function build() {
  const app = Fastify({
    logger: false
  })

  // Register plugins
  await app.register(prismaPlugin)
  await app.register(errorHandler)
  await app.register(authPlugin)

  // Register routes
  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(userRoutes, { prefix: '/api/users' })
  await app.register(postRoutes, { prefix: '/api/posts' })
  await app.register(commentRoutes, { prefix: '/api/comments' })

  await app.ready()
  return app
}