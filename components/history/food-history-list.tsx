"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { formatTime, getMealTypeLabel, formatCalories } from "@/lib/utils"
import { Trash2, Calendar } from "lucide-react"

interface FoodEntry {
  id: string
  user_id: string
  entry_type: "image" | "barcode" | "manual"
  food_data: any
  meal_type: string
  consumed_at: string
  created_at: string
}

export function FoodHistoryList() {
  const [isLoading, setIsLoading] = useState(true)
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const { toast } = useToast()

  useEffect(() => {
    fetchEntries()
  }, [date])

  async function fetchEntries() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/food/entries?date=${date}`)
      const data = await response.json()

      if (data.success) {
        setEntries(data.entries)
      }
    } catch (error) {
      console.error("Error fetching entries:", error)
      toast({
        title: "Error",
        description: "Failed to load food entries",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteEntry(id: string) {
    try {
      const response = await fetch("/api/food/entries", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entryId: id }),
      })

      const data = await response.json()

      if (data.success) {
        setEntries(entries.filter((entry) => entry.id !== id))
        toast({
          title: "Entry deleted",
          description: "Food entry has been removed",
        })
      } else {
        throw new Error(data.error || "Failed to delete entry")
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      })
    }
  }

  // Calculate daily totals
  const dailyTotals = entries.reduce(
    (totals, entry) => {
      const foodData = entry.food_data

      if (foodData && foodData.total) {
        totals.calories += foodData.total.calories || 0
        totals.protein += foodData.total.protein || 0
        totals.carbs += foodData.total.carbs || 0
        totals.fat += foodData.total.fat || 0
      }

      return totals
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="date-filter">Filter by Date</Label>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input id="date-filter" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <Button variant="outline" onClick={() => setDate(new Date().toISOString().split("T")[0])}>
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No food entries for this date.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Daily Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Calories</p>
                  <p className="text-2xl font-bold">{formatCalories(dailyTotals.calories)}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-2xl font-bold">{Math.round(dailyTotals.protein)}g</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-2xl font-bold">{Math.round(dailyTotals.carbs)}g</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Fat</p>
                  <p className="text-2xl font-bold">{Math.round(dailyTotals.fat)}g</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {entries.map((entry) => {
              const firstItem = entry.food_data?.items?.[0]
              const itemName = firstItem?.name || "Unknown food"
              const calories = entry.food_data?.total?.calories || 0
              const protein = entry.food_data?.total?.protein || 0
              const carbs = entry.food_data?.total?.carbs || 0
              const fat = entry.food_data?.total?.fat || 0

              return (
                <Card key={entry.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                          {entry.entry_type === "image" ? (
                            <span className="text-xs">Photo</span>
                          ) : entry.entry_type === "barcode" ? (
                            <span className="text-xs">Barcode</span>
                          ) : (
                            <span className="text-xs">Manual</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{itemName}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{getMealTypeLabel(entry.meal_type)}</span>
                            <span className="mx-1">•</span>
                            <span>{formatTime(entry.consumed_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Cal:</span>
                            <span className="ml-1 font-medium">{formatCalories(calories)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">P:</span>
                            <span className="ml-1 font-medium">{Math.round(protein)}g</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">C:</span>
                            <span className="ml-1 font-medium">{Math.round(carbs)}g</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">F:</span>
                            <span className="ml-1 font-medium">{Math.round(fat)}g</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEntry(entry.id)}
                          aria-label="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

