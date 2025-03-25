interface UserHealth {
  age: number
  weight: number
  height: number
  gender: "male" | "female"
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active"
  goal: "maintain" | "lose" | "gain"
}

export interface Meal {
  name: string
  calories: number
  macros: {
    protein: number
    carbs: number
    fat: number
  }
  timing: string
  prepNotes?: string
}

interface DailyMeals {
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  snacks: Meal[]
  totalCalories: number
  totalMacros: {
    protein: number
    carbs: number
    fat: number
  }
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
      monday: DailyMeals
      tuesday: DailyMeals
      wednesday: DailyMeals
      thursday: DailyMeals
      friday: DailyMeals
      saturday: DailyMeals
      sunday: DailyMeals
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
  // Define meal timing suggestions
  const mealTimings = {
    breakfast: "7:00 AM - 9:00 AM",
    lunch: "12:00 PM - 2:00 PM",
    dinner: "6:00 PM - 8:00 PM",
    morningSnack: "10:00 AM - 11:00 AM",
    afternoonSnack: "3:00 PM - 4:00 PM",
    eveningSnack: "9:00 PM (if needed)"
  }

  // Define base meals with macros
  const breakfastOptions: Meal[] = [
    {
      name: "Oatmeal with berries and protein powder",
      calories: 400,
      macros: { protein: 25, carbs: 55, fat: 10 },
      timing: mealTimings.breakfast,
      prepNotes: "Prepare oats with water or almond milk. Add 1 scoop protein powder and 1 cup mixed berries."
    },
    {
      name: "Greek yogurt parfait",
      calories: 380,
      macros: { protein: 22, carbs: 45, fat: 12 },
      timing: mealTimings.breakfast,
      prepNotes: "Layer yogurt with granola and honey. Can be prepared the night before."
    },
    {
      name: "Whole grain toast with eggs and avocado",
      calories: 450,
      macros: { protein: 24, carbs: 35, fat: 28 },
      timing: mealTimings.breakfast,
      prepNotes: "Toast bread, mash 1/2 avocado, cook 2 eggs to preference."
    },
    {
      name: "Protein smoothie bowl",
      calories: 420,
      macros: { protein: 30, carbs: 50, fat: 14 },
      timing: mealTimings.breakfast,
      prepNotes: "Blend protein, banana, spinach, and milk. Top with granola and seeds."
    }
  ]

  const lunchOptions: Meal[] = [
    {
      name: "Grilled chicken salad",
      calories: 450,
      macros: { protein: 35, carbs: 25, fat: 28 },
      timing: mealTimings.lunch,
      prepNotes: "Prep chicken and vegetables in advance. Add dressing just before eating."
    },
    {
      name: "Turkey and avocado sandwich",
      calories: 480,
      macros: { protein: 28, carbs: 45, fat: 24 },
      timing: mealTimings.lunch,
      prepNotes: "Use whole grain bread, 4-5 slices turkey, 1/2 avocado, and vegetables."
    },
    {
      name: "Quinoa protein bowl",
      calories: 520,
      macros: { protein: 25, carbs: 65, fat: 20 },
      timing: mealTimings.lunch,
      prepNotes: "Cook quinoa in advance. Add roasted vegetables and protein of choice."
    },
    {
      name: "Tuna wrap with mixed greens",
      calories: 420,
      macros: { protein: 32, carbs: 35, fat: 18 },
      timing: mealTimings.lunch,
      prepNotes: "Mix tuna with light mayo or Greek yogurt. Use whole grain wrap."
    }
  ]

  const dinnerOptions: Meal[] = [
    {
      name: "Salmon with sweet potato and broccoli",
      calories: 520,
      macros: { protein: 35, carbs: 45, fat: 25 },
      timing: mealTimings.dinner,
      prepNotes: "Season salmon with herbs. Roast sweet potato and broccoli together."
    },
    {
      name: "Lean beef stir-fry",
      calories: 550,
      macros: { protein: 40, carbs: 50, fat: 22 },
      timing: mealTimings.dinner,
      prepNotes: "Slice beef thinly. Prepare vegetables in advance for quick cooking."
    },
    {
      name: "Chicken breast with quinoa",
      calories: 480,
      macros: { protein: 38, carbs: 45, fat: 18 },
      timing: mealTimings.dinner,
      prepNotes: "Marinate chicken in advance. Cook quinoa in bulk for the week."
    },
    {
      name: "Black bean and vegetable curry",
      calories: 450,
      macros: { protein: 20, carbs: 65, fat: 15 },
      timing: mealTimings.dinner,
      prepNotes: "Prepare curry sauce in advance. Use pre-cooked rice."
    }
  ]

  const snackOptions: Meal[] = [
    {
      name: "Apple with almond butter",
      calories: 200,
      macros: { protein: 5, carbs: 25, fat: 12 },
      timing: mealTimings.morningSnack
    },
    {
      name: "Protein bar",
      calories: 220,
      macros: { protein: 20, carbs: 25, fat: 8 },
      timing: mealTimings.afternoonSnack
    },
    {
      name: "Mixed nuts and dried fruit",
      calories: 180,
      macros: { protein: 6, carbs: 15, fat: 14 },
      timing: mealTimings.afternoonSnack
    },
    {
      name: "Greek yogurt with berries",
      calories: 150,
      macros: { protein: 15, carbs: 20, fat: 3 },
      timing: mealTimings.eveningSnack
    },
    {
      name: "Protein shake",
      calories: 160,
      macros: { protein: 25, carbs: 10, fat: 3 },
      timing: mealTimings.morningSnack
    }
  ]

  // Function to calculate daily totals
  function calculateDailyTotals(meals: { breakfast: Meal; lunch: Meal; dinner: Meal; snacks: Meal[] }): DailyMeals {
    const totalMacros = {
      protein: meals.breakfast.macros.protein + meals.lunch.macros.protein + meals.dinner.macros.protein + 
               meals.snacks.reduce((sum, snack) => sum + snack.macros.protein, 0),
      carbs: meals.breakfast.macros.carbs + meals.lunch.macros.carbs + meals.dinner.macros.carbs +
             meals.snacks.reduce((sum, snack) => sum + snack.macros.carbs, 0),
      fat: meals.breakfast.macros.fat + meals.lunch.macros.fat + meals.dinner.macros.fat +
           meals.snacks.reduce((sum, snack) => sum + snack.macros.fat, 0)
    }

    return {
      ...meals,
      totalCalories: meals.breakfast.calories + meals.lunch.calories + meals.dinner.calories +
                    meals.snacks.reduce((sum, snack) => sum + snack.calories, 0),
      totalMacros
    }
  }

  // Calculate target distribution
  const targetDistribution = {
    breakfast: 0.25, // 25% of daily calories
    lunch: 0.3,      // 30% of daily calories
    dinner: 0.3,     // 30% of daily calories
    snacks: 0.15     // 15% of daily calories
  }

  // Calculate target calories for each meal
  const targetCalories = {
    breakfast: Math.round(dailyCalories * targetDistribution.breakfast),
    lunch: Math.round(dailyCalories * targetDistribution.lunch),
    dinner: Math.round(dailyCalories * targetDistribution.dinner),
    snacks: Math.round(dailyCalories * targetDistribution.snacks)
  }

  // Function to scale a meal's calories and macros
  function scaleMeal(meal: Meal, targetCals: number): Meal {
    const scaleFactor = targetCals / meal.calories
    return {
      ...meal,
      calories: Math.round(meal.calories * scaleFactor),
      macros: {
        protein: Math.round(meal.macros.protein * scaleFactor),
        carbs: Math.round(meal.macros.carbs * scaleFactor),
        fat: Math.round(meal.macros.fat * scaleFactor)
      },
      prepNotes: meal.prepNotes ? `${meal.prepNotes} (${Math.round(scaleFactor * 100)}% portion)` : undefined
    }
  }

  // Generate a week of meals
  function generateDailyMeals(): DailyMeals {
    // Select random meals
    const breakfast = breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)]
    const lunch = lunchOptions[Math.floor(Math.random() * lunchOptions.length)]
    const dinner = dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)]
    
    // Calculate how many snacks based on daily calories
    const numSnacks = dailyCalories > 2500 ? 3 : dailyCalories < 1800 ? 1 : 2
    const snackCaloriesPerSnack = Math.round(targetCalories.snacks / numSnacks)
    
    // Select and scale snacks
    const snacks = Array.from({ length: numSnacks }, () => {
      const snack = snackOptions[Math.floor(Math.random() * snackOptions.length)]
      return scaleMeal(snack, snackCaloriesPerSnack)
    })

    // Scale main meals to match target calories
    const scaledMeals = {
      breakfast: scaleMeal(breakfast, targetCalories.breakfast),
      lunch: scaleMeal(lunch, targetCalories.lunch),
      dinner: scaleMeal(dinner, targetCalories.dinner),
      snacks
    }

    // Calculate totals
    const totals = calculateDailyTotals(scaledMeals)

    // Ensure totals match daily targets
    const finalAdjustment = dailyCalories / totals.totalCalories
    if (Math.abs(1 - finalAdjustment) > 0.05) { // Only adjust if more than 5% off
      return {
        breakfast: scaleMeal(scaledMeals.breakfast, scaledMeals.breakfast.calories * finalAdjustment),
        lunch: scaleMeal(scaledMeals.lunch, scaledMeals.lunch.calories * finalAdjustment),
        dinner: scaleMeal(scaledMeals.dinner, scaledMeals.dinner.calories * finalAdjustment),
        snacks: scaledMeals.snacks.map(snack => 
          scaleMeal(snack, snack.calories * finalAdjustment)
        ),
        totalCalories: dailyCalories,
        totalMacros: {
          protein: Math.round(totals.totalMacros.protein * finalAdjustment),
          carbs: Math.round(totals.totalMacros.carbs * finalAdjustment),
          fat: Math.round(totals.totalMacros.fat * finalAdjustment)
        }
      }
    }

    return totals
  }

  // Generate full week plan
  return {
    monday: generateDailyMeals(),
    tuesday: generateDailyMeals(),
    wednesday: generateDailyMeals(),
    thursday: generateDailyMeals(),
    friday: generateDailyMeals(),
    saturday: generateDailyMeals(),
    sunday: generateDailyMeals()
  }
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