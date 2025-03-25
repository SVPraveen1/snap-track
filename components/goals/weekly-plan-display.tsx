"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { generatePlan } from "./plan-generator"

interface WeeklyPlan {
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

export function WeeklyPlanDisplay() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  useEffect(() => {
    loadPlan()
  }, [])

  async function loadPlan() {
    try {
      const supabase = createClient()
      const { data: latestPlan, error } = await supabase
        .from("weekly_plans")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error("Error loading plan:", error)
        return
      }

      if (latestPlan) {
        setPlan(latestPlan.plan_data as WeeklyPlan)
      }
    } catch (error) {
      console.error("Error loading plan:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading your personalized plan...</div>
  }

  if (!plan) {
    return <div>No plan available. Please generate a plan from the Goals section.</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workout">Workout Plan</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="space-y-4">
          {weekDays.map((day) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle>{day}</CardTitle>
              </CardHeader>
              <CardContent>
                {plan.workoutPlan[day.toLowerCase()]?.exercises.map((exercise, index) => (
                  <div key={index} className="mb-2">
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {exercise.sets} sets × {exercise.reps}
                      {exercise.notes && ` - ${exercise.notes}`}
                    </div>
                  </div>
                ))}
                {plan.workoutPlan[day.toLowerCase()]?.cardio && (
                  <div className="mt-2">
                    <div className="font-medium">Cardio</div>
                    <div className="text-sm text-muted-foreground">
                      {plan.workoutPlan[day.toLowerCase()]?.cardio}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Nutrition Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Daily Calories</div>
                  <div className="text-2xl font-bold">{plan.nutritionPlan.dailyCalories}</div>
                </div>
                <div>
                  <div className="font-medium">Macros</div>
                  <div>Protein: {plan.nutritionPlan.macros.protein}g</div>
                  <div>Carbs: {plan.nutritionPlan.macros.carbs}g</div>
                  <div>Fat: {plan.nutritionPlan.macros.fat}g</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meal Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="font-medium">Breakfast Options</div>
                  <ul className="list-disc list-inside">
                    {plan.nutritionPlan.mealPlan.breakfast.map((meal, index) => (
                      <li key={index}>{meal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium">Lunch Options</div>
                  <ul className="list-disc list-inside">
                    {plan.nutritionPlan.mealPlan.lunch.map((meal, index) => (
                      <li key={index}>{meal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium">Dinner Options</div>
                  <ul className="list-disc list-inside">
                    {plan.nutritionPlan.mealPlan.dinner.map((meal, index) => (
                      <li key={index}>{meal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium">Healthy Snacks</div>
                  <ul className="list-disc list-inside">
                    {plan.nutritionPlan.mealPlan.snacks.map((snack, index) => (
                      <li key={index}>{snack}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {plan.nutritionPlan.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 