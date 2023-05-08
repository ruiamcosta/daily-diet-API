interface Meal {
  id: string
  name: string
  description: string
  created_at: string
  is_on_diet: boolean
  user_id: string
}

export function calculateBestDaySequence(meals: Meal[]) {
  let bestDaySequence = 0
  let currentSequence = 0

  for (const meal of meals) {
    if (meal.is_on_diet) {
      currentSequence++
    } else {
      bestDaySequence = Math.max(bestDaySequence, currentSequence)
      currentSequence = 0
    }
  }

  return bestDaySequence
}
