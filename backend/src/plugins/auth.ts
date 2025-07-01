import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import { config } from '../config/index.js'
import { User } from '@prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>
    authorize: (roles: string[]) => (request: any, reply: any) => Promise<void>
  }
  interface FastifyRequest {
    user?: User
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string; role: string }
    user: User
  }
}

const authPluginFn: FastifyPluginAsync = async (fastify) => {
  await fastify.register(jwt, {
    secret: config.jwtSecret,
    sign: { expiresIn: config.jwtExpiresIn }
  })

  fastify.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify()
      
      // Verify session exists and is valid
      const session = await fastify.prisma.session.findUnique({
        where: { token: request.headers.authorization?.replace('Bearer ', '') },
        include: { user: true }
      })

      if (!session || session.expiresAt < new Date()) {
        throw new Error('Invalid or expired session')
      }

      request.user = session.user
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' })
    }
  })

  fastify.decorate('authorize', function (roles: string[]) {
    return async function (request: any, reply: any) {
      await fastify.authenticate(request, reply)
      
      if (!roles.includes(request.user.role)) {
        reply.status(403).send({ error: 'Forbidden' })
      }
    }
  })
}

export const authPlugin = fp(authPluginFn, {
  name: 'auth',
  dependencies: ['prisma']
})

export default authPlugin