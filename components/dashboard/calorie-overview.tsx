"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

interface NutritionPlan {
  dailyCalories: number
  macros: {
    protein: number
    carbs: number
    fat: number
  }
}

interface DailyProgress {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface CalorieOverviewProps {
  className?: string
}

export function CalorieOverview({ className }: CalorieOverviewProps) {
  const [plan, setPlan] = useState<NutritionPlan | null>(null)
  const [progress, setProgress] = useState<DailyProgress>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNutritionPlan()
    loadTodayProgress()
  }, [])

  async function loadNutritionPlan() {
    try {
      const supabase = createClient()
      const { data: latestPlan } = await supabase
        .from("weekly_plans")
        .select("plan")
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (latestPlan?.plan?.nutritionPlan) {
        setPlan({
          dailyCalories: latestPlan.plan.nutritionPlan.dailyCalories,
          macros: latestPlan.plan.nutritionPlan.macros
        })
      }
    } catch (error) {
      console.error("Error loading nutrition plan:", error)
    }
  }

  async function loadTodayProgress() {
    try {
      const supabase = createClient()
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

      const { data: entries } = await supabase
        .from("food_entries")
        .select("food_data")
        .gte("consumed_at", startOfDay)
        .lte("consumed_at", endOfDay)

      if (entries) {
        const totals = entries.reduce(
          (acc, entry) => {
            const foodData = entry.food_data?.total || {}
            return {
              calories: (acc.calories || 0) + (foodData.calories || 0),
              protein: (acc.protein || 0) + (foodData.protein || 0),
              carbs: (acc.carbs || 0) + (foodData.carbs || 0),
              fat: (acc.fat || 0) + (foodData.fat || 0),
            }
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )
        setProgress(totals)
      }
    } catch (error) {
      console.error("Error loading today's progress:", error)
    }
  }

  function calculatePercentage(current: number, target: number) {
    if (!target) return 0
    const percentage = (current / target) * 100
    return Math.min(100, Math.max(0, percentage))
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Calorie Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calories</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(progress.calories)}</div>
                <div className="text-xs text-muted-foreground">
                  of {plan?.dailyCalories || '---'} kcal
                </div>
                <Progress 
                  value={calculatePercentage(progress.calories, plan?.dailyCalories || 0)} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Protein</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(progress.protein)}g</div>
                <div className="text-xs text-muted-foreground">
                  of {plan?.macros.protein || '---'}g
                </div>
                <Progress 
                  value={calculatePercentage(progress.protein, plan?.macros.protein || 0)} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carbs</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(progress.carbs)}g</div>
                <div className="text-xs text-muted-foreground">
                  of {plan?.macros.carbs || '---'}g
                </div>
                <Progress 
                  value={calculatePercentage(progress.carbs, plan?.macros.carbs || 0)} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fat</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(progress.fat)}g</div>
                <div className="text-xs text-muted-foreground">
                  of {plan?.macros.fat || '---'}g
                </div>
                <Progress 
                  value={calculatePercentage(progress.fat, plan?.macros.fat || 0)} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {plan && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                View your complete nutrition and workout schedule
              </div>
              <Link href="/weekly-plan">
                <Button variant="outline" className="gap-2">
                  <CalendarIcon />
                  View Weekly Plan
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

