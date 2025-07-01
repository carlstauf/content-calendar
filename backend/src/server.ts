import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { config } from './config/index.js'
import { authPlugin } from './plugins/auth.js'
import { prismaPlugin } from './plugins/prisma.js'
import { errorHandler } from './plugins/error-handler.js'
import { authRoutes } from './routes/auth.js'
import { userRoutes } from './routes/users.js'
import { postRoutes } from './routes/posts.js'
import { commentRoutes } from './routes/comments.js'

const server = Fastify({
  logger: {
    level: config.logLevel,
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
})

async function start() {
  try {
    // Security plugins
    await server.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'https:', 'data:'],
        }
      }
    })

    await server.register(cors, {
      origin: config.corsOrigin,
      credentials: true
    })

    await server.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute'
    })

    // Core plugins
    await server.register(prismaPlugin)
    await server.register(errorHandler)
    await server.register(authPlugin)

    // Routes
    await server.register(authRoutes, { prefix: '/api/auth' })
    await server.register(userRoutes, { prefix: '/api/users' })
    await server.register(postRoutes, { prefix: '/api/posts' })
    await server.register(commentRoutes, { prefix: '/api/comments' })

    // Health check
    server.get('/health', async () => ({ status: 'ok' }))

    await server.listen({ port: config.port, host: '0.0.0.0' })
    
    console.log(`🚀 Server running at http://localhost:${config.port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()