import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { calculateBestDaySequence } from '../utils/calculateBestDaySequence'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      is_on_diet: z.boolean(),
    })

    const { name, description, is_on_diet } = createMealBodySchema.parse(
      request.body,
    )

    const { sessionId } = request.cookies

    const userIdSchema = z.object({
      id: z.string(),
    })

    const { id } = userIdSchema.parse(
      await knex('users').where('session_id', sessionId).select('id').first(),
    )

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_on_diet,
      user_id: id,
    })

    return reply.status(201).send()
  })

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const userIdSchema = z.object({
        id: z.string(),
      })

      const { id } = userIdSchema.parse(
        await knex('users').where('session_id', sessionId).select('id').first(),
      )

      const meals = await knex('meals')
        .where({
          user_id: id,
        })
        .select()

      return { meals }
    },
  )

  app.get(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const userIdSchema = z.object({
        id: z.string(),
      })

      const { id } = userIdSchema.parse(
        await knex('users').where('session_id', sessionId).select('id').first(),
      )

      const mealParamsSchema = z.object({
        mealId: z.string(),
      })

      const { mealId } = mealParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({
          id: mealId,
          user_id: id,
        })
        .select()
        .first()

      return { meal }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const userIdSchema = z.object({
        id: z.string(),
      })

      const { id } = userIdSchema.parse(
        await knex('users').where('session_id', sessionId).select('id').first(),
      )

      const totalRegisteredMeals = await knex('meals')
        .where('user_id', id)
        .count('id', { as: 'Total registered meals' })
        .first()

      const totalMealsWithinDiet = await knex('meals')
        .where({
          user_id: id,
          is_on_diet: true,
        })
        .count('id', { as: 'Meals within the diet' })
        .first()

      const totalMealsOffDiet = await knex('meals')
        .where({
          user_id: id,
          is_on_diet: false,
        })
        .count('id', { as: 'Meals off the diet' })
        .first()

      const summary = {
        totalRegisteredMeals,
        totalMealsWithinDiet,
        totalMealsOffDiet,
      }

      return { summary }
    },
  )

  app.get(
    '/bestdaysequence/:date',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const userIdSchema = z.object({
        id: z.string(),
      })

      const { id } = userIdSchema.parse(
        await knex('users').where('session_id', sessionId).select('id').first(),
      )

      const mealParamsSchema = z.object({
        date: z.string(),
      })

      const { date } = mealParamsSchema.parse(request.params)

      const newDate = new Date(date)

      const meals = await knex('meals').where('user_id', id).select()

      const mealsFromSpecificDay = meals.filter(
        (meal) => new Date(meal.created_at).getDate() === newDate.getDate(),
      )

      const bestDaySequence = calculateBestDaySequence(mealsFromSpecificDay)

      return { bestDaySequence }
    },
  )

  app.patch(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const userIdSchema = z.object({
        id: z.string(),
      })

      const { id } = userIdSchema.parse(
        await knex('users').where('session_id', sessionId).select('id').first(),
      )

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        is_on_diet: z.boolean(),
      })

      const { name, description, is_on_diet } = updateMealBodySchema.parse(
        request.body,
      )

      const mealParamsSchema = z.object({
        mealId: z.string(),
      })

      const { mealId } = mealParamsSchema.parse(request.params)

      await knex('meals')
        .where({
          id: mealId,
          user_id: id,
        })
        .update({
          name,
          description,
          is_on_diet,
        })

      return reply.status(204).send()
    },
  )

  app.delete(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const userIdSchema = z.object({
        id: z.string(),
      })

      const { id } = userIdSchema.parse(
        await knex('users').where('session_id', sessionId).select('id').first(),
      )

      const mealParamsSchema = z.object({
        mealId: z.string(),
      })

      const { mealId } = mealParamsSchema.parse(request.params)

      await knex('meals')
        .where({
          id: mealId,
          user_id: id,
        })
        .first()
        .delete()

      return reply.status(204).send()
    },
  )
}
