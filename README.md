# Ignite NodeJS Rocketseat 
- Project developed as 'Challenge 02' of the Module 'Creating REST API with Node.js' at Rocketseat Ignite 
- The application consists of a REST API with Node.js for daily diet tracking
- The application was developed with, eslint, dotenv, fastify, knex, zod sqlite, tsup to build the project and the tests with vitest and supertest

### Application rules
- It should be possible to create a user
- It must be possible to identify the user between requests
- It must be possible to record a meal made, with the following information:
 
  *Meals must be related to a user*
  -	Name
  -	Description
  -	Date and time
  - Are on the diet or not
- It must be possible to edit a meal
- It must be possible to delete a meal
- It should be possible to list all meals of a user
- It must be possible to visualize a single meal
- It must be possible to retrieve a user's metrics
  -	Total amount of registered meals
  -	Total amount of meals within the diet
  -	Total number of off-diet meals
  -	Best sequence per day of meals which he created
- The user can only view, edit and delete meals that he created

### To run the application
```
npm install
npm run knex -- migrate:latest
npm run dev
```

### To run the tests
```
npm run test
```
