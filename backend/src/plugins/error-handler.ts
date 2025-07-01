import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { ZodError } from 'zod'

const errorHandlerFn: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      reply.status(400).send({
        error: 'Validation Error',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
      return
    }

    if (error.statusCode) {
      reply.status(error.statusCode).send({
        error: error.message
      })
      return
    }

    fastify.log.error(error)
    reply.status(500).send({
      error: 'Internal Server Error'
    })
  })
}

export const errorHandler = fp(errorHandlerFn, {
  name: 'error-handler'
})

export default errorHandler