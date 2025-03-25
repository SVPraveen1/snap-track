interface UserHealth {
  age: number
  weight: number
  height: number
  gender: "male" | "female"
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active"
  goal: "maintain" | "lose" | "gain"
}

export interface WeeklyPlan {
  workoutPlan: {
    [key: string]: {
      exercises: Array<{
        name: string
        sets: number
        reps: string
        notes?: string
      }>
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
    mealPlan: {
      breakfast: string[]
      lunch: string[]
      dinner: string[]
      snacks: string[]
    }
    recommendations: string[]
  }
}

export function generatePlan(userHealth: UserHealth): WeeklyPlan {
  // Validate input data
  if (!validateUserHealth(userHealth)) {
    throw new Error("Invalid user health data provided")
  }

  // Calculate base metrics
  const { dailyCalories, protein, carbs, fat } = calculateNutrition(userHealth)
  
  return {
    workoutPlan: generateWorkoutPlan(userHealth),
    nutritionPlan: {
      dailyCalories,
      macros: {
        protein,
        carbs,
        fat
      },
      mealPlan: generateMealPlan(userHealth, dailyCalories),
      recommendations: generateRecommendations(userHealth)
    }
  }
}

function validateUserHealth(data: UserHealth): boolean {
  return (
    data.age > 0 &&
    data.age < 120 &&
    data.weight > 0 &&
    data.weight < 500 &&
    data.height > 0 &&
    data.height < 300 &&
    ["male", "female"].includes(data.gender) &&
    ["sedentary", "light", "moderate", "active", "very_active"].includes(data.activity_level) &&
    ["maintain", "lose", "gain"].includes(data.goal)
  )
}

function calculateNutrition(data: UserHealth) {
  // Convert weight to kg if in pounds (assuming input is in pounds)
  const weightInKg = data.weight * 0.453592
  
  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr
  if (data.gender === "male") {
    bmr = 10 * weightInKg + 6.25 * data.height - 5 * data.age + 5
  } else {
    bmr = 10 * weightInKg + 6.25 * data.height - 5 * data.age - 161
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }

  const goalMultipliers = {
    lose: 0.8,
    maintain: 1,
    gain: 1.2,
  }

  const tdee = bmr * activityMultipliers[data.activity_level]
  const dailyCalories = Math.round(tdee * goalMultipliers[data.goal])

  // Calculate macros with improved ratios based on goal
  const protein = Math.round(weightInKg * (data.goal === "gain" ? 2.2 : 2)) // 2.2g/kg for muscle gain, 2g/kg otherwise
  const fat = Math.round((dailyCalories * (data.goal === "lose" ? 0.3 : 0.25)) / 9) // 30% for fat loss, 25% otherwise
  const carbs = Math.round((dailyCalories - (protein * 4 + fat * 9)) / 4)

  return { dailyCalories, protein, carbs, fat }
}

function generateWorkoutPlan(data: UserHealth) {
  const workoutPlan: WeeklyPlan["workoutPlan"] = {
    monday: {
      exercises: [
        { name: "Squats", sets: 4, reps: "8-12" },
        { name: "Bench Press", sets: 4, reps: "8-12" },
        { name: "Rows", sets: 4, reps: "8-12" }
      ],
      cardio: "20 minutes moderate intensity"
    },
    tuesday: {
      exercises: [
        { name: "Deadlifts", sets: 4, reps: "6-8" },
        { name: "Shoulder Press", sets: 4, reps: "8-12" },
        { name: "Pull-ups", sets: 3, reps: "As many as possible" }
      ]
    },
    wednesday: {
      exercises: [
        { name: "Lunges", sets: 3, reps: "12 each leg" },
        { name: "Push-ups", sets: 3, reps: "12-15" }
      ],
      cardio: "30 minutes low intensity"
    },
    thursday: {
      exercises: [
        { name: "Romanian Deadlifts", sets: 4, reps: "8-12" },
        { name: "Dumbbell Press", sets: 4, reps: "8-12" }
      ]
    },
    friday: {
      exercises: [
        { name: "Hip Thrusts", sets: 4, reps: "12-15" },
        { name: "Lat Pulldowns", sets: 4, reps: "10-12" }
      ],
      cardio: "20 minutes high intensity intervals"
    },
    saturday: {
      exercises: [
        { name: "Core Circuit", sets: 3, reps: "1 minute each exercise" }
      ],
      cardio: "45 minutes moderate intensity"
    },
    sunday: {
      exercises: [],
      cardio: "Light walking or recovery activities"
    }
  }

  // Adjust based on goals and activity level
  if (data.goal === "lose") {
    Object.keys(workoutPlan).forEach(day => {
      if (workoutPlan[day].cardio) {
        workoutPlan[day].cardio += " (increase intensity if possible)"
      }
    })
  }

  if (data.activity_level === "sedentary" || data.activity_level === "light") {
    // Reduce workout intensity for beginners
    Object.keys(workoutPlan).forEach(day => {
      workoutPlan[day].exercises = workoutPlan[day].exercises.map(exercise => ({
        ...exercise,
        sets: Math.max(2, exercise.sets - 1),
        notes: "Focus on form and gradually increase weight"
      }))
    })
  }

  return workoutPlan
}

function generateMealPlan(data: UserHealth, dailyCalories: number) {
  const mealPlan = {
    breakfast: [
      "Oatmeal with berries and protein powder",
      "Greek yogurt with granola and honey",
      "Whole grain toast with eggs and avocado",
      "Protein smoothie with banana and spinach"
    ],
    lunch: [
      "Grilled chicken salad with olive oil dressing",
      "Turkey and avocado sandwich on whole grain bread",
      "Quinoa bowl with roasted vegetables and tofu",
      "Tuna wrap with mixed greens"
    ],
    dinner: [
      "Salmon with sweet potato and broccoli",
      "Lean beef stir-fry with brown rice",
      "Chicken breast with quinoa and asparagus",
      "Black bean and vegetable curry with brown rice"
    ],
    snacks: [
      "Apple with almond butter",
      "Protein bar",
      "Mixed nuts and dried fruit",
      "Carrot sticks with hummus",
      "Greek yogurt with berries"
    ]
  }

  // Adjust portions based on caloric needs
  if (dailyCalories < 1800) {
    mealPlan.snacks = mealPlan.snacks.slice(0, 2)
  } else if (dailyCalories > 2500) {
    mealPlan.snacks.push("Protein shake", "Banana with peanut butter")
  }

  return mealPlan
}

function generateRecommendations(data: UserHealth) {
  const recommendations = [
    "Stay hydrated by drinking at least 8 glasses of water daily",
    "Get 7-9 hours of sleep each night for optimal recovery",
    "Track your meals using the app to ensure you're meeting your goals",
    "Take progress photos and measurements every 4 weeks"
  ]

  if (data.goal === "lose") {
    recommendations.push(
      "Create a slight caloric deficit through diet and exercise",
      "Focus on protein-rich foods to preserve muscle mass",
      "Consider meal prepping to control portions"
    )
  } else if (data.goal === "gain") {
    recommendations.push(
      "Eat frequent meals throughout the day",
      "Include calorie-dense healthy foods like nuts and avocados",
      "Drink smoothies if struggling to meet caloric needs"
    )
  }

  if (data.activity_level === "sedentary" || data.activity_level === "light") {
    recommendations.push(
      "Start slowly and gradually increase workout intensity",
      "Focus on proper form before increasing weights",
      "Consider working with a trainer initially"
    )
  }

  return recommendations
} 