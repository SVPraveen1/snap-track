"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

export function ImageUploadForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mealType, setMealType] = useState<string>("lunch")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedFile) {
      setError("Please select an image")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Convert image to base64
      const base64Image = preview?.split(',')[1]
      if (!base64Image) throw new Error("Failed to process image")

      // Get current user
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // First, analyze the image
      const analyzeResponse = await fetch("/api/food/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      })

      if (!analyzeResponse.ok) {
        throw new Error("Failed to analyze image")
      }

      const foodData = await analyzeResponse.json()
      
      if (!foodData.items?.[0]) {
        throw new Error("No food items detected in the image")
      }

      // Create the food entry
      const foodEntryData = {
        user_id: user.id,
        entry_type: "image",
        food_name: foodData.items[0].name,
        food_data: foodData,
        image_url: null, // or store the image URL if you're saving images
        meal_type: mealType,
        consumed_at: new Date().toISOString()
      }

      const saveResponse = await fetch("/api/food/image-recognition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(foodEntryData),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || "Failed to save food entry")
      }

      // Clear the form
      setSelectedFile(null)
      setPreview(null)
      
      // You might want to trigger a refresh of the food entries list here
      // or show a success message

    } catch (error) {
      console.error("Error analyzing image:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meal-type">Meal Type</Label>
            <Select
              value={mealType}
              onValueChange={setMealType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Food Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>

          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-auto rounded-lg"
                style={{ maxHeight: "200px" }}
              />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? "Analyzing..." : "Analyze Image"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 