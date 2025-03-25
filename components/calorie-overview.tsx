"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCalories, formatMacro } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface NutritionTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface UserPreferences {
  daily_calorie_goal: number
  daily_protein_goal: number
  daily_carbs_goal: number
  daily_fat_goal: number
}

interface CalorieOverviewProps {
  className?: string
}

export function CalorieOverview({ className }: CalorieOverviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [totals, setTotals] = useState<NutritionTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })
  const [preferences, setPreferences] = useState<UserPreferences>({
    daily_calorie_goal: 2000,
    daily_protein_goal: 50,
    daily_carbs_goal: 250,
    daily_fat_goal: 70,
  })

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch user preferences
        const prefsResponse = await fetch("/api/user/preferences")
        const prefsData = await prefsResponse.json()

        if (prefsData.success) {
          setPreferences(prefsData.preferences)
        }

        // Fetch food entries for the day
        const entriesResponse = await fetch(`/api/food/entries?date=${date}`)
        const entriesData = await entriesResponse.json()

        if (entriesData.success) {
          // Calculate totals from entries
          const dailyTotals = entriesData.entries.reduce(
            (acc: NutritionTotals, entry: any) => {
              const foodData = entry.food_data

              if (foodData && foodData.total) {
                acc.calories += foodData.total.calories || 0
                acc.protein += foodData.total.protein || 0
                acc.carbs += foodData.total.carbs || 0
                acc.fat += foodData.total.fat || 0
              }

              return acc
            },
            {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            },
          )

          setTotals(dailyTotals)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [date])

  const caloriePercentage = Math.min(100, (totals.calories / preferences.daily_calorie_goal) * 100)
  const proteinPercentage = Math.min(100, (totals.protein / preferences.daily_protein_goal) * 100)
  const carbsPercentage = Math.min(100, (totals.carbs / preferences.daily_carbs_goal) * 100)
  const fatPercentage = Math.min(100, (totals.fat / preferences.daily_fat_goal) * 100)

  return (
    <Card className={`dashboard-card ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle>Today's Nutrition</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Calories</span>
                <span className="text-sm text-muted-foreground">
                  {formatCalories(totals.calories)} / {formatCalories(preferences.daily_calorie_goal)} kcal
                </span>
              </div>
              <Progress value={caloriePercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Protein</span>
                <span className="text-sm text-muted-foreground">
                  {formatMacro(totals.protein)} / {formatMacro(preferences.daily_protein_goal)} g
                </span>
              </div>
              <Progress value={proteinPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Carbs</span>
                <span className="text-sm text-muted-foreground">
                  {formatMacro(totals.carbs)} / {formatMacro(preferences.daily_carbs_goal)} g
                </span>
              </div>
              <Progress value={carbsPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fat</span>
                <span className="text-sm text-muted-foreground">
                  {formatMacro(totals.fat)} / {formatMacro(preferences.daily_fat_goal)} g
                </span>
              </div>
              <Progress value={fatPercentage} className="h-2" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

