"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'
import { WeeklyPlan, generatePlan } from "@/components/goals/plan-generator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { redirect } from "next/navigation"

export default function WeeklyPlanPage() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkUser()
    loadPlan()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/login')
    }
  }

  async function loadPlan() {
    try {
      const { data: planData } = await supabase
        .from("weekly_plans")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (planData?.plan) {
        setPlan(planData.plan as WeeklyPlan)
      }
    } catch (error) {
      console.error("Error loading plan:", error)
      toast({
        title: "Error",
        description: "Failed to load your plan. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading your personalized plan...</div>
  }

  if (!plan) {
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
} 