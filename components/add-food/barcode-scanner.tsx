"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Barcode, Loader2, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { mealTypeOptions } from "@/lib/utils"
import { FoodResultCard } from "@/components/add-food/food-result-card"

export function BarcodeScanner() {
  const [barcode, setBarcode] = useState("")
  const [mealType, setMealType] = useState("other")
  const [consumedAt, setConsumedAt] = useState(new Date().toISOString().slice(0, 16))
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!barcode) {
      toast({
        title: "No barcode entered",
        description: "Please enter a barcode to search for the product",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/food/barcode?barcode=${barcode}`)
      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        toast({
          title: "Product found",
          description: "We've found the product and calculated the nutritional information",
        })
      } else {
        throw new Error(data.error || "Failed to find product")
      }
    } catch (error) {
      console.error("Error finding product:", error)
      toast({
        title: "Error",
        description: "Failed to find the product. Please check the barcode and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    if (!result) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/food/barcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foodData: result,
          mealType,
          consumedAt: new Date(consumedAt).toISOString(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Food entry saved",
          description: "Your food has been added to your diary",
        })
        router.push("/dashboard")
      } else {
        throw new Error(data.error || "Failed to save food entry")
      }
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

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Product Barcode</Label>
              <div className="flex space-x-2">
                <Input
                  ref={barcodeInputRef}
                  id="barcode"
                  placeholder="Enter barcode number"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
                <Button type="submit" disabled={!barcode || isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted">
              <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                <Barcode className="h-8 w-8 text-muted-foreground" />
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">Enter a barcode number</span>
                  <span className="text-xs text-muted-foreground">Type the barcode number from your packaged food</span>
                </div>
              </div>
            </div>

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
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <FoodResultCard result={result} />
          <Button onClick={handleSave} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save and Return to Dashboard"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

