import { it, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'

import { app } from '../src/app'

describe('User and meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  it('should be able to create a user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'jd@gmail.com',
      })
      .expect(201)
  })

  it('should not be able to create a user with a existing email', async () => {
    await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'jd@gmail.com',
    })

    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'jd@gmail.com',
      })
      .expect(400)
  })

  it('should be able to create a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'jd@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Melhor prato do mundo',
        description: 'Prato muito bom',
        is_on_diet: false,
      })
      .expect(201)
  })

  it('should be able to get a specif meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'jd@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor prato do mundo',
      description: 'Prato muito bom',
      is_on_diet: false,
    })

    const listMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMeals.body.meals[0].id

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(mealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Melhor prato do mundo',
        description: 'Prato muito bom',
        is_on_diet: 0,
      }),
    )
  })

  it('should be able to get the meals summary', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'jd@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor prato do mundo 1',
      description: 'Prato muito bom',
      is_on_diet: false,
    })
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor salada do mundo 1',
      description: 'Prato muito bom',
      is_on_diet: true,
    })
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor prato do mundo 2',
      description: 'Prato muito bom',
      is_on_diet: false,
    })
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor salada do mundo 2',
      description: 'Prato muito bom',
      is_on_diet: true,
    })

    const summaryResponse = await request(app.server)
      .get('/meals/summary')
      .set('Cookie', cookies)

    console.log(summaryResponse.body.summary)

    expect(summaryResponse.body.summary).toEqual(
      expect.objectContaining({
        totalRegisteredMeals: { 'Total registered meals': 4 },
        totalMealsWithinDiet: { 'Meals within the diet': 2 },
        totalMealsOffDiet: { 'Meals off the diet': 2 },
      }),
    )
  })

  it('should be able to get update a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'jd@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor prato do mundo',
      description: 'Prato muito bom',
      is_on_diet: false,
    })

    const listMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMeals.body.meals[0].id

    await request(app.server)
      .patch(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Melhor salada do mundo',
        description: 'Prato muito bom',
        is_on_diet: true,
      })
      .expect(204)
  })

  it('should be able to get delete a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'jd@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor prato do mundo',
      description: 'Prato muito bom',
      is_on_diet: false,
    })

    const listMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMeals.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)
  })

  it('should be able to get the best day sequence', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'jd@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor prato do mundo',
      description: 'Prato muito bom',
      is_on_diet: false,
    })
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor prato do mundo',
      description: 'Prato muito bom',
      is_on_diet: true,
    })
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor prato do mundo',
      description: 'Prato muito bom',
      is_on_diet: true,
    })
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor prato do mundo',
      description: 'Prato muito bom',
      is_on_diet: true,
    })
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor prato do mundo',
      description: 'Prato muito bom',
      is_on_diet: false,
    })
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor prato do mundo',
      description: 'Prato muito bom',
      is_on_diet: true,
    })
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Melhor prato do mundo',
      description: 'Prato muito bom',
      is_on_diet: true,
    })

    const listMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const date = listMeals.body.meals[0].created_at
    const createdDate = date.split(' ')[0]

    console.log(createdDate)

    const bestSequenceResponse = await request(app.server)
      .get(`/meals/bestdaysequence/${createdDate}`)
      .set('Cookie', cookies)

    expect(bestSequenceResponse.body.bestDaySequence).toEqual(3)
  })
})
