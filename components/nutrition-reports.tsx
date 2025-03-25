"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { formatCalories } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export function NutritionReports() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("weekly")
  const [timeRange, setTimeRange] = useState("last7days")
  const [reportData, setReportData] = useState<any>(null)

  const { toast } = useToast()

  useEffect(() => {
    fetchReportData()
  }, [activeTab, timeRange])

  async function fetchReportData() {
    setIsLoading(true)
    try {
      // Calculate date range based on selected time range
      const endDate = new Date()
      const startDate = new Date()

      if (activeTab === "weekly") {
        if (timeRange === "last7days") {
          startDate.setDate(endDate.getDate() - 7)
        } else if (timeRange === "last14days") {
          startDate.setDate(endDate.getDate() - 14)
        } else if (timeRange === "last30days") {
          startDate.setDate(endDate.getDate() - 30)
        }
      } else if (activeTab === "monthly") {
        if (timeRange === "last3months") {
          startDate.setMonth(endDate.getMonth() - 3)
        } else if (timeRange === "last6months") {
          startDate.setMonth(endDate.getMonth() - 6)
        } else if (timeRange === "last12months") {
          startDate.setMonth(endDate.getMonth() - 12)
        }
      }

      // Fetch food entries for the date range
      const supabase = createClient()
      const { data, error } = await supabase
        .from("food_entries")
        .select("*")
        .gte("consumed_at", startDate.toISOString())
        .lte("consumed_at", endDate.toISOString())
        .order("consumed_at", { ascending: true })

      if (error) {
        throw error
      }

      // Process data for reports
      const processedData = processReportData(data || [], activeTab, startDate, endDate)
      setReportData(processedData)
    } catch (error) {
      console.error("Error fetching report data:", error)
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function processReportData(entries: any[], reportType: string, startDate: Date, endDate: Date) {
    if (entries.length === 0) {
      return {
        labels: [],
        datasets: {
          calories: [],
          protein: [],
          carbs: [],
          fat: [],
        },
        summary: {
          totalCalories: 0,
          avgCalories: 0,
          totalProtein: 0,
          avgProtein: 0,
          totalCarbs: 0,
          avgCarbs: 0,
          totalFat: 0,
          avgFat: 0,
        },
      }
    }

    const dateMap: Record<
      string,
      {
        calories: number
        protein: number
        carbs: number
        fat: number
        count: number
      }
    > = {}

    // Group entries by date or month
    entries.forEach((entry) => {
      const date = new Date(entry.consumed_at)
      let key

      if (reportType === "weekly") {
        key = date.toISOString().split("T")[0] // YYYY-MM-DD
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` // YYYY-MM
      }

      if (!dateMap[key]) {
        dateMap[key] = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
      }

      const foodData = entry.food_data

      if (foodData && foodData.total) {
        dateMap[key].calories += foodData.total.calories || 0
        dateMap[key].protein += foodData.total.protein || 0
        dateMap[key].carbs += foodData.total.carbs || 0
        dateMap[key].fat += foodData.total.fat || 0
        dateMap[key].count += 1
      }
    })

    // Fill in missing dates
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      let key

      if (reportType === "weekly") {
        key = currentDate.toISOString().split("T")[0] // YYYY-MM-DD
      } else {
        key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}` // YYYY-MM
      }

      if (!dateMap[key]) {
        dateMap[key] = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
      }

      if (reportType === "weekly") {
        currentDate.setDate(currentDate.getDate() + 1)
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    }

    // Sort keys and prepare data for chart
    const sortedKeys = Object.keys(dateMap).sort()

    const labels = sortedKeys.map((key) => {
      if (reportType === "weekly") {
        return key
      } else {
        const [year, month] = key.split("-")
        return `${month}/${year}`
      }
    })

    const datasets = {
      calories: sortedKeys.map((key) => dateMap[key].calories),
      protein: sortedKeys.map((key) => dateMap[key].protein),
      carbs: sortedKeys.map((key) => dateMap[key].carbs),
      fat: sortedKeys.map((key) => dateMap[key].fat),
    }

    // Calculate summary statistics
    const totalDays = sortedKeys.length
    const totalCalories = datasets.calories.reduce((sum, val) => sum + val, 0)
    const totalProtein = datasets.protein.reduce((sum, val) => sum + val, 0)
    const totalCarbs = datasets.carbs.reduce((sum, val) => sum + val, 0)
    const totalFat = datasets.fat.reduce((sum, val) => sum + val, 0)

    const summary = {
      totalCalories,
      avgCalories: totalDays > 0 ? totalCalories / totalDays : 0,
      totalProtein,
      avgProtein: totalDays > 0 ? totalProtein / totalDays : 0,
      totalCarbs,
      avgCarbs: totalDays > 0 ? totalCarbs / totalDays : 0,
      totalFat,
      avgFat: totalDays > 0 ? totalFat / totalDays : 0,
    }

    return { labels, datasets, summary }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {activeTab === "weekly" ? (
                  <>
                    <SelectItem value="last7days">Last 7 days</SelectItem>
                    <SelectItem value="last14days">Last 14 days</SelectItem>
                    <SelectItem value="last30days">Last 30 days</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="last3months">Last 3 months</SelectItem>
                    <SelectItem value="last6months">Last 6 months</SelectItem>
                    <SelectItem value="last12months">Last 12 months</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calorie Intake</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg. Daily Calories</p>
                  <p className="text-2xl font-bold">{formatCalories(reportData.summary.avgCalories)}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg. Daily Protein</p>
                  <p className="text-2xl font-bold">{Math.round(reportData.summary.avgProtein)}g</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg. Daily Carbs</p>
                  <p className="text-2xl font-bold">{Math.round(reportData.summary.avgCarbs)}g</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg. Daily Fat</p>
                  <p className="text-2xl font-bold">{Math.round(reportData.summary.avgFat)}g</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calorie Intake</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.labels.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available for the selected time period
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Chart visualization would be displayed here</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Macronutrient Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.labels.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available for the selected time period
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Chart visualization would be displayed here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

