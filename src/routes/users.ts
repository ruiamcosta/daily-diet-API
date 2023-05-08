import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const user = await knex('users').select()

    return { user }
  })

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    const userEmailExists = await knex('users').where('email', email).first()

    if (userEmailExists) {
      return reply.status(400).send({
        message: 'This user already exists',
      })
    }

    const sessionId = randomUUID()
    reply.setCookie('sessionId', sessionId)

    await knex('users')
      .insert({
        id: randomUUID(),
        session_id: sessionId,
        name,
        email,
      })
      .returning('*')

    return reply.status(201).send()
  })
}
