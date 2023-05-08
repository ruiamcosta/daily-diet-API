import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id?: string
      name: string
      email: string
      created_at: string
    }
    meals: {
      id: string
      name: string
      description: string
      created_at: string
      is_on_diet: boolean
      user_id: string
    }
  }
}
