export interface UserHealth {
  age: number
  weight: number
  height: number
  gender: "male" | "female" | "other"
  activity_level: "sedentary" | "light" | "moderate" | "very_active" | "extra_active"
  goal: "lose" | "maintain" | "gain"
}

export interface WeeklyPlan {
  workoutPlan: {
    [key: string]: {
      exercises: {
        name: string
        sets: number
        reps: string | number
        notes?: string
      }[]
      cardio?: string
    }
  }
  nutritionPlan: {
    dailyCalories: number
    macros: {
      protein: number
      carbs: number
      fat: number
    }
    recommendations: string[]
  }
}

export function generatePlan(userHealth: UserHealth): WeeklyPlan {
  // Calculate base nutrition metrics
  const { dailyCalories, macros } = calculateNutrition(userHealth)

  // Generate workout plan
  const workoutPlan = generateWorkoutPlan(userHealth)

  // Generate nutrition recommendations
  const recommendations = generateRecommendations(userHealth)

  return {
    workoutPlan,
    nutritionPlan: {
      dailyCalories,
      macros,
      recommendations
    }
  }
}

function calculateNutrition(userHealth: UserHealth) {
  // BMR calculation using Mifflin-St Jeor Equation
  let bmr: number
  if (userHealth.gender === "male") {
    bmr = 10 * userHealth.weight + 6.25 * userHealth.height - 5 * userHealth.age + 5
  } else {
    bmr = 10 * userHealth.weight + 6.25 * userHealth.height - 5 * userHealth.age - 161
  }

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  }

  // Calculate daily calories based on goal
  let dailyCalories = bmr * activityMultipliers[userHealth.activity_level]
  switch (userHealth.goal) {
    case "lose":
      dailyCalories -= 500 // 500 calorie deficit for ~0.5kg/week loss
      break
    case "gain":
      dailyCalories += 500 // 500 calorie surplus for ~0.5kg/week gain
      break
    // "maintain" case doesn't modify calories
  }

  // Calculate macros based on goal
  let macros: { protein: number; carbs: number; fat: number }
  switch (userHealth.goal) {
    case "lose":
      macros = {
        protein: Math.round(userHealth.weight * 2.2), // 2.2g per kg for muscle preservation
        carbs: Math.round(dailyCalories * 0.3 / 4), // 30% of calories from carbs
        fat: Math.round(dailyCalories * 0.3 / 9) // 30% of calories from fat
      }
      break
    case "gain":
      macros = {
        protein: Math.round(userHealth.weight * 2.2), // 2.2g per kg for muscle growth
        carbs: Math.round(dailyCalories * 0.5 / 4), // 50% of calories from carbs
        fat: Math.round(dailyCalories * 0.2 / 9) // 20% of calories from fat
      }
      break
    default: // maintain
      macros = {
        protein: Math.round(userHealth.weight * 2), // 2g per kg
        carbs: Math.round(dailyCalories * 0.4 / 4), // 40% of calories from carbs
        fat: Math.round(dailyCalories * 0.3 / 9) // 30% of calories from fat
      }
  }

  return { dailyCalories, macros }
}

function generateWorkoutPlan(userHealth: UserHealth) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  const workoutPlan: WeeklyPlan["workoutPlan"] = {}

  days.forEach(day => {
    workoutPlan[day] = {
      exercises: [],
      cardio: undefined
    }
  })

  // Add exercises based on goal and activity level
  switch (userHealth.goal) {
    case "lose":
      // Focus on cardio and full-body workouts
      workoutPlan.monday.exercises = [
        { name: "Full Body Circuit", sets: 3, reps: 12, notes: "3 rounds" },
        { name: "Plank", sets: 3, reps: 1, notes: "Hold for 60 seconds" }
      ]
      workoutPlan.monday.cardio = "30 minutes moderate intensity cardio"

      workoutPlan.wednesday.exercises = [
        { name: "HIIT Circuit", sets: 4, reps: 15, notes: "4 rounds" },
        { name: "Mountain Climbers", sets: 3, reps: 1, notes: "60 seconds" }
      ]
      workoutPlan.wednesday.cardio = "20 minutes high intensity intervals"

      workoutPlan.friday.exercises = [
        { name: "Lower Body Focus", sets: 4, reps: 12, notes: "4 rounds" },
        { name: "Russian Twists", sets: 3, reps: 20, notes: "Each side" }
      ]
      workoutPlan.friday.cardio = "30 minutes steady state cardio"
      break

    case "gain":
      // Focus on strength training and progressive overload
      workoutPlan.monday.exercises = [
        { name: "Chest & Triceps", sets: 4, reps: 8, notes: "Progressive weight" },
        { name: "Incline Dumbbell Press", sets: 3, reps: 10 }
      ]

      workoutPlan.wednesday.exercises = [
        { name: "Back & Biceps", sets: 4, reps: 8, notes: "Progressive weight" },
        { name: "Pull-ups", sets: 3, reps: "Max" }
      ]

      workoutPlan.friday.exercises = [
        { name: "Legs & Shoulders", sets: 4, reps: 8, notes: "Progressive weight" },
        { name: "Squats", sets: 3, reps: 10 }
      ]
      break

    default: // maintain
      // Balanced approach with moderate intensity
      workoutPlan.monday.exercises = [
        { name: "Upper Body", sets: 3, reps: 12 },
        { name: "Core Circuit", sets: 3, reps: 15, notes: "3 rounds" }
      ]
      workoutPlan.monday.cardio = "20 minutes moderate cardio"

      workoutPlan.wednesday.exercises = [
        { name: "Lower Body", sets: 3, reps: 12 },
        { name: "Stability Exercises", sets: 3, reps: 12 }
      ]
      workoutPlan.wednesday.cardio = "20 minutes moderate cardio"

      workoutPlan.friday.exercises = [
        { name: "Full Body", sets: 3, reps: 12 },
        { name: "Flexibility", sets: 1, reps: 1, notes: "15 minutes stretching" }
      ]
      workoutPlan.friday.cardio = "20 minutes moderate cardio"
  }

  return workoutPlan
}

function generateRecommendations(userHealth: UserHealth): string[] {
  const recommendations: string[] = []

  // Hydration recommendations
  recommendations.push("Drink at least 8 glasses of water daily")
  recommendations.push("Stay hydrated during workouts")

  // Sleep recommendations
  recommendations.push("Aim for 7-9 hours of sleep per night")
  recommendations.push("Maintain consistent sleep schedule")

  // Activity recommendations
  if (userHealth.activity_level === "sedentary") {
    recommendations.push("Try to incorporate more movement throughout the day")
    recommendations.push("Consider taking short walks during breaks")
  }

  // Goal-specific recommendations
  switch (userHealth.goal) {
    case "lose":
      recommendations.push("Focus on creating a sustainable calorie deficit")
      recommendations.push("Include high-protein foods to maintain muscle mass")
      recommendations.push("Consider tracking food intake to ensure you're meeting your goals")
      break
    case "gain":
      recommendations.push("Focus on progressive overload in your workouts")
      recommendations.push("Ensure you're eating enough protein for muscle growth")
      recommendations.push("Consider meal timing around workouts")
      break
    default: // maintain
      recommendations.push("Maintain a balanced diet with variety")
      recommendations.push("Stay consistent with your workout routine")
      recommendations.push("Monitor your progress and adjust as needed")
  }

  return recommendations
} 