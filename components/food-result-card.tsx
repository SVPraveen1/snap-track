"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCalories, formatMacro } from "@/lib/utils"

interface FoodResultCardProps {
  result: {
    items: Array<{
      name: string
      calories: number
      protein: number
      carbs: number
      fat: number
      image?: string
    }>
    total: {
      calories: number
      protein: number
      carbs: number
      fat: number
    }
  }
}

export function FoodResultCard({ result }: FoodResultCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Food Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {result.items.map((item, index) => (
            <div key={index} className="flex items-start space-x-4">
              {item.image ? (
                <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No image</span>
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                <div className="grid grid-cols-4 gap-2 mt-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Calories:</span>
                    <span className="ml-1">{formatCalories(item.calories)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Protein:</span>
                    <span className="ml-1">{formatMacro(item.protein)}g</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbs:</span>
                    <span className="ml-1">{formatMacro(item.carbs)}g</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fat:</span>
                    <span className="ml-1">{formatMacro(item.fat)}g</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4 mt-4 border-t">
            <h4 className="font-medium">Total Nutrition</h4>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <div>
                <span className="text-muted-foreground">Calories:</span>
                <span className="ml-1 font-medium">{formatCalories(result.total.calories)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Protein:</span>
                <span className="ml-1 font-medium">{formatMacro(result.total.protein)}g</span>
              </div>
              <div>
                <span className="text-muted-foreground">Carbs:</span>
                <span className="ml-1 font-medium">{formatMacro(result.total.carbs)}g</span>
              </div>
              <div>
                <span className="text-muted-foreground">Fat:</span>
                <span className="ml-1 font-medium">{formatMacro(result.total.fat)}g</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

