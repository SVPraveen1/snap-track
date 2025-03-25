"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

interface NutritionInsight {
  title: string
  description: string
  type: "info" | "warning" | "success"
}

export function NutritionInsights() {
  const [isLoading, setIsLoading] = useState(true)
  const [insights, setInsights] = useState<NutritionInsight[]>([])

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch food entries for the past week
        const today = new Date()
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)

        const response = await fetch("/api/food/entries?limit=50")
        const data = await response.json()

        if (data.success) {
          // Generate insights based on entries
          const generatedInsights = generateInsights(data.entries)
          setInsights(generatedInsights)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  function generateInsights(entries: any[]): NutritionInsight[] {
    if (entries.length === 0) {
      return [
        {
          title: "Start tracking your meals",
          description: "Add your first meal to get personalized nutrition insights.",
          type: "info",
        },
      ]
    }

    const insights: NutritionInsight[] = []

    // Calculate average daily calories
    const dailyCalories: Record<string, number> = {}

    entries.forEach((entry) => {
      const date = new Date(entry.consumed_at).toISOString().split("T")[0]
      const calories = entry.food_data?.total?.calories || 0

      if (!dailyCalories[date]) {
        dailyCalories[date] = 0
      }

      dailyCalories[date] += calories
    })

    const avgDailyCalories =
      Object.values(dailyCalories).reduce((sum, cal) => sum + cal, 0) / Math.max(1, Object.keys(dailyCalories).length)

    // Check protein intake
    const totalProtein = entries.reduce((sum, entry) => sum + (entry.food_data?.total?.protein || 0), 0)
    const avgDailyProtein = totalProtein / Math.max(1, Object.keys(dailyCalories).length)

    // Generate insights based on the data
    if (avgDailyCalories > 2500) {
      insights.push({
        title: "High calorie intake",
        description: "Your average daily calorie intake is higher than recommended. Consider reducing portion sizes.",
        type: "warning",
      })
    } else if (avgDailyCalories < 1200) {
      insights.push({
        title: "Low calorie intake",
        description: "Your average daily calorie intake seems low. Make sure you're getting enough nutrition.",
        type: "warning",
      })
    } else {
      insights.push({
        title: "Balanced calorie intake",
        description: "Your calorie intake is within a healthy range. Keep it up!",
        type: "success",
      })
    }

    if (avgDailyProtein < 50) {
      insights.push({
        title: "Increase protein intake",
        description: "Consider adding more protein-rich foods to your diet for better muscle maintenance and satiety.",
        type: "info",
      })
    }

    // Add a consistency insight
    if (Object.keys(dailyCalories).length >= 5) {
      insights.push({
        title: "Consistent tracking",
        description: "Great job consistently tracking your meals! This helps build better habits.",
        type: "success",
      })
    }

    return insights.slice(0, 3) // Return top 3 insights
  }

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle>Nutrition Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  insight.type === "info"
                    ? "bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800"
                    : insight.type === "warning"
                      ? "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800"
                      : "bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800"
                }`}
              >
                <div className="mt-0.5">
                  {insight.type === "info" ? (
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : insight.type === "warning" ? (
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div>
                  <h4
                    className={`font-medium ${
                      insight.type === "info"
                        ? "text-blue-700 dark:text-blue-400"
                        : insight.type === "warning"
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-green-700 dark:text-green-400"
                    }`}
                  >
                    {insight.title}
                  </h4>
                  <p className="text-sm mt-1 text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

