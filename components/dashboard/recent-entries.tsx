"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, getMealTypeLabel, formatCalories } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface FoodEntry {
  id: string
  user_id: string
  entry_type: "image" | "barcode" | "manual"
  food_data: any
  meal_type: string
  consumed_at: string
  created_at: string
}

export function RecentEntries() {
  const [isLoading, setIsLoading] = useState(true)
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/food/entries?limit=5")
      const data = await response.json()

      if (data.success) {
        setEntries(data.entries)
      }
    } catch (error) {
      console.error("Error fetching entries:", error)
      toast({
        title: "Error",
        description: "Failed to load recent entries",
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

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle>Recent Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">No food entries yet. Add your first meal!</div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const firstItem = entry.food_data?.items?.[0]
              const itemName = firstItem?.name || "Unknown food"
              const calories = entry.food_data?.total?.calories || 0

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                      {entry.entry_type === "image" ? (
                        <span className="text-xs font-medium">Photo</span>
                      ) : entry.entry_type === "barcode" ? (
                        <span className="text-xs font-medium">Barcode</span>
                      ) : (
                        <span className="text-xs font-medium">Manual</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{itemName}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{getMealTypeLabel(entry.meal_type)}</span>
                        <span className="mx-1">•</span>
                        <span>{formatDate(entry.consumed_at)}</span>
                        <span className="mx-1">•</span>
                        <span>{formatCalories(calories)} kcal</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)} aria-label="Delete entry">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

