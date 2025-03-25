"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { formatCalories } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function NutritionReports() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("weekly")
  const [timeRange, setTimeRange] = useState("last7days")
  const [reportData, setReportData] = useState<any>(null)
  const [chartType, setChartType] = useState("line")

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

  function prepareChartData(labels: string[], datasets: any) {
    return labels.map((label, index) => ({
      name: label,
      calories: datasets.calories[index],
      protein: datasets.protein[index],
      carbs: datasets.carbs[index],
      fat: datasets.fat[index],
    }))
  }

  function preparePieChartData(summary: any) {
    return [
      { name: "Protein", value: summary.avgProtein },
      { name: "Carbs", value: summary.avgCarbs },
      { name: "Fat", value: summary.avgFat },
    ]
  }

  const renderLineChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="calories" stroke="#8884d8" name="Calories" />
        <Line type="monotone" dataKey="protein" stroke="#82ca9d" name="Protein (g)" />
        <Line type="monotone" dataKey="carbs" stroke="#ffc658" name="Carbs (g)" />
        <Line type="monotone" dataKey="fat" stroke="#ff7300" name="Fat (g)" />
      </LineChart>
    </ResponsiveContainer>
  )

  const renderBarChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="calories" fill="#8884d8" name="Calories" />
        <Bar dataKey="protein" fill="#82ca9d" name="Protein (g)" />
        <Bar dataKey="carbs" fill="#ffc658" name="Carbs (g)" />
        <Bar dataKey="fat" fill="#ff7300" name="Fat (g)" />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderPieChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )

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

            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Distribution</SelectItem>
                </SelectContent>
              </Select>

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
              <CardTitle>Nutrition Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[400px] w-full" />
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
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Average Calories</div>
                  <div className="text-2xl font-bold">{formatCalories(reportData.summary.avgCalories)}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Average Protein</div>
                  <div className="text-2xl font-bold">{reportData.summary.avgProtein.toFixed(1)}g</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Average Carbs</div>
                  <div className="text-2xl font-bold">{reportData.summary.avgCarbs.toFixed(1)}g</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Average Fat</div>
                  <div className="text-2xl font-bold">{reportData.summary.avgFat.toFixed(1)}g</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nutrition Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {chartType === "line" && renderLineChart(prepareChartData(reportData.labels, reportData.datasets))}
              {chartType === "bar" && renderBarChart(prepareChartData(reportData.labels, reportData.datasets))}
              {chartType === "pie" && renderPieChart(preparePieChartData(reportData.summary))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

