"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { mealTypeOptions } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface FoodItem {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export function ManualEntryForm() {
  const [mealType, setMealType] = useState("other")
  const [consumedAt, setConsumedAt] = useState(new Date().toISOString().slice(0, 16))
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<FoodItem[]>([{ name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }])

  const { toast } = useToast()
  const router = useRouter()

  function handleItemChange(index: number, field: keyof FoodItem, value: string | number) {
    const newItems = [...items]

    if (field === "name") {
      newItems[index][field] = value as string
    } else {
      // Convert to number and ensure it's not negative
      const numValue = Math.max(0, Number(value))
      newItems[index][field] = numValue
    }

    setItems(newItems)
  }

  function addItem() {
    setItems([...items, { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }])
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      const newItems = [...items]
      newItems.splice(index, 1)
      setItems(newItems)
    }
  }

  function calculateTotals() {
    return items.reduce(
      (totals, item) => {
        return {
          calories: totals.calories + item.calories,
          protein: totals.protein + item.protein,
          carbs: totals.carbs + item.carbs,
          fat: totals.fat + item.fat,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate form
    if (items.some((item) => !item.name)) {
      toast({
        title: "Missing information",
        description: "Please provide a name for each food item",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const totals = calculateTotals()

      const foodData = {
        items,
        total: totals,
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from("food_entries")
        .insert({
          entry_type: "manual",
          food_data: foodData,
          meal_type: mealType,
          consumed_at: new Date(consumedAt).toISOString(),
        })
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Food entry saved",
        description: "Your meal has been added to your food diary",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving food entry:", error)
      toast({
        title: "Error",
        description: "Failed to save the food entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger id="meal-type">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumed-at">When Consumed</Label>
                <Input
                  id="consumed-at"
                  type="datetime-local"
                  value={consumedAt}
                  onChange={(e) => setConsumedAt(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Food Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-name`}>Food Name</Label>
                    <Input
                      id={`item-${index}-name`}
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      placeholder="e.g., Chicken Breast"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`item-${index}-calories`}>Calories</Label>
                      <Input
                        id={`item-${index}-calories`}
                        type="number"
                        min="0"
                        value={item.calories}
                        onChange={(e) => handleItemChange(index, "calories", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`item-${index}-protein`}>Protein (g)</Label>
                      <Input
                        id={`item-${index}-protein`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.protein}
                        onChange={(e) => handleItemChange(index, "protein", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`item-${index}-carbs`}>Carbs (g)</Label>
                      <Input
                        id={`item-${index}-carbs`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.carbs}
                        onChange={(e) => handleItemChange(index, "carbs", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`item-${index}-fat`}>Fat (g)</Label>
                      <Input
                        id={`item-${index}-fat`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.fat}
                        onChange={(e) => handleItemChange(index, "fat", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">Meal Totals</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Calories:</span>
                  <span className="ml-1 font-medium">{Math.round(totals.calories)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Protein:</span>
                  <span className="ml-1 font-medium">{totals.protein.toFixed(1)}g</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Carbs:</span>
                  <span className="ml-1 font-medium">{totals.carbs.toFixed(1)}g</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fat:</span>
                  <span className="ml-1 font-medium">{totals.fat.toFixed(1)}g</span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save and Return to Dashboard"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

