import { createClient } from "@/utils/supabase/server"
import { WeeklyPlan } from "@/components/goals/plan-generator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default async function WeeklyPlanPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to view your weekly plan.</p>
            <Link href="/login">
              <Button className="mt-4">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: planData } = await supabase
    .from("weekly_plans")
    .select("*")
    .eq("user_id", user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!planData) {
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

  const plan: WeeklyPlan = planData.plan

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Weekly Plan</h1>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
              <Link href="/goals">
                <Button variant="outline">Update Goals</Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Nutrition Plan</CardTitle>
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
              <CardTitle>Meal Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Breakfast</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {plan.nutritionPlan.mealPlan.breakfast.map((meal: string, index: number) => (
                      <li key={index}>{meal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Lunch</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {plan.nutritionPlan.mealPlan.lunch.map((meal: string, index: number) => (
                      <li key={index}>{meal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Dinner</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {plan.nutritionPlan.mealPlan.dinner.map((meal: string, index: number) => (
                      <li key={index}>{meal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Snacks</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {plan.nutritionPlan.mealPlan.snacks.map((snack: string, index: number) => (
                      <li key={index}>{snack}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workout Plan</CardTitle>
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
} 