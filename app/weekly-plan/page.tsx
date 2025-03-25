import { createClient } from "@/utils/supabase/server"
import { WeeklyPlan, Meal } from "@/components/goals/plan-generator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { redirect } from "next/navigation"

export default async function WeeklyPlanPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: planData } = await supabase
    .from("weekly_plans")
    .select("*")
    .eq("user_id", user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!planData?.plan) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>No Plan Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Please generate a weekly plan from the goals page.</p>
                <Link href="/goals">
                  <Button className="mt-4">Go to Goals</Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  try {
    const plan: WeeklyPlan = typeof planData.plan === 'string' ? JSON.parse(planData.plan) : planData.plan
    if (!plan?.nutritionPlan?.mealPlan) {
      throw new Error('Invalid plan structure')
    }

    const dayMap = {
      'sunday': 'sunday',
      'monday': 'monday',
      'tuesday': 'tuesday',
      'wednesday': 'wednesday',
      'thursday': 'thursday',
      'friday': 'friday',
      'saturday': 'saturday'
    } as const

    const today = dayMap[new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof dayMap]
    let currentDayMeals = plan.nutritionPlan.mealPlan[today]

    if (!currentDayMeals?.totalCalories || !currentDayMeals?.totalMacros) {
      currentDayMeals = plan.nutritionPlan.mealPlan.monday
    }

    if (!currentDayMeals?.totalCalories || !currentDayMeals?.totalMacros) {
      throw new Error('Invalid meal plan data')
    }

    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Weekly Plan</h1>
              <div className="flex gap-2">
                <Link href="/dashboard">
                  <Button variant="outline">Back to Dashboard</Button>
                </Link>
                <Link href="/goals">
                  <Button>Update Goals</Button>
                </Link>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Nutrition Plan - Daily Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Daily Calories</div>
                    <div className="text-2xl font-bold">{plan.nutritionPlan.dailyCalories}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Protein</div>
                    <div className="text-2xl font-bold">{plan.nutritionPlan.macros.protein}g</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Carbs</div>
                    <div className="text-2xl font-bold">{plan.nutritionPlan.macros.carbs}g</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Fat</div>
                    <div className="text-2xl font-bold">{plan.nutritionPlan.macros.fat}g</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Meal Plan</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Daily Total: {currentDayMeals.totalCalories} calories 
                  (Protein: {currentDayMeals.totalMacros.protein}g, 
                  Carbs: {currentDayMeals.totalMacros.carbs}g, 
                  Fat: {currentDayMeals.totalMacros.fat}g)
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Breakfast</h3>
                      <div className="space-y-2">
                        <p>{currentDayMeals.breakfast.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Timing: {currentDayMeals.breakfast.timing}
                        </p>
                        <p className="text-sm">
                          {currentDayMeals.breakfast.calories} calories 
                          (P: {currentDayMeals.breakfast.macros.protein}g, 
                          C: {currentDayMeals.breakfast.macros.carbs}g, 
                          F: {currentDayMeals.breakfast.macros.fat}g)
                        </p>
                        {currentDayMeals.breakfast.prepNotes && (
                          <p className="text-sm text-muted-foreground">
                            Prep: {currentDayMeals.breakfast.prepNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Lunch</h3>
                      <div className="space-y-2">
                        <p>{currentDayMeals.lunch.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Timing: {currentDayMeals.lunch.timing}
                        </p>
                        <p className="text-sm">
                          {currentDayMeals.lunch.calories} calories 
                          (P: {currentDayMeals.lunch.macros.protein}g, 
                          C: {currentDayMeals.lunch.macros.carbs}g, 
                          F: {currentDayMeals.lunch.macros.fat}g)
                        </p>
                        {currentDayMeals.lunch.prepNotes && (
                          <p className="text-sm text-muted-foreground">
                            Prep: {currentDayMeals.lunch.prepNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Dinner</h3>
                      <div className="space-y-2">
                        <p>{currentDayMeals.dinner.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Timing: {currentDayMeals.dinner.timing}
                        </p>
                        <p className="text-sm">
                          {currentDayMeals.dinner.calories} calories 
                          (P: {currentDayMeals.dinner.macros.protein}g, 
                          C: {currentDayMeals.dinner.macros.carbs}g, 
                          F: {currentDayMeals.dinner.macros.fat}g)
                        </p>
                        {currentDayMeals.dinner.prepNotes && (
                          <p className="text-sm text-muted-foreground">
                            Prep: {currentDayMeals.dinner.prepNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    {currentDayMeals.snacks.length > 0 && (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Snacks</h3>
                        <div className="space-y-4">
                          {currentDayMeals.snacks.map((snack: Meal, index: number) => (
                            <div key={index} className="space-y-2">
                              <p>{snack.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Timing: {snack.timing}
                              </p>
                              <p className="text-sm">
                                {snack.calories} calories 
                                (P: {snack.macros.protein}g, 
                                C: {snack.macros.carbs}g, 
                                F: {snack.macros.fat}g)
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Workout Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(plan.workoutPlan).map(([day, workout]) => (
                    <div key={day} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2 capitalize">{day}</h3>
                      {workout.exercises.length > 0 && (
                        <div className="mb-2">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Exercises:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {workout.exercises.map((exercise, index) => (
                              <li key={index}>
                                {exercise.name} - {exercise.sets} sets × {exercise.reps}
                                {exercise.notes && <span className="text-sm text-muted-foreground"> ({exercise.notes})</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {workout.cardio && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Cardio:</h4>
                          <p>{workout.cardio}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {plan.nutritionPlan.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading plan:', error)
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Loading Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p>There was an error loading your plan. Please try generating a new plan from the goals page.</p>
                <Link href="/goals">
                  <Button className="mt-4">Go to Goals</Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }
} 