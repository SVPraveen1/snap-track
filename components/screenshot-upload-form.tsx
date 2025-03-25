"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, ImageIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { mealTypeOptions } from "@/lib/utils"
import { FoodResultCard } from "@/components/add-food/food-result-card"

export function ScreenshotUploadForm() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [mealType, setMealType] = useState("other")
  const [consumedAt, setConsumedAt] = useState(new Date().toISOString().slice(0, 16))
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleImageChange = useCallback((file: File) => {
    if (file) {
      console.log("Processing file:", file.name, file.type, `${Math.round(file.size / 1024)}KB`)
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setResult(null)
    }
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageChange(file)
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        handleImageChange(file)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        })
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!image) {
      toast({
        title: "No image selected",
        description: "Please upload a screenshot of your food",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("Analyzing image:", image.name)

      const formData = new FormData()
      formData.append("image", image)
      formData.append("mealType", mealType)
      formData.append("consumedAt", new Date(consumedAt).toISOString())

      const response = await fetch("/api/food/image-recognition", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error response:", errorText)
        throw new Error(`API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log("Analysis response:", data)

      if (data.success) {
        setResult(data.data)
        toast({
          title: "Food analyzed successfully",
          description: "We've identified your meal and calculated the nutritional information",
        })
      } else {
        throw new Error(data.error || "Failed to analyze image")
      }
    } catch (error) {
      console.error("Error analyzing image:", error)
      toast({
        title: "Error",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleSaveAndReturn() {
    toast({
      title: "Food entry saved",
      description: "Your meal has been added to your food diary",
    })
    router.push("/profile/dashboard")
  }

  return (
    <div className="space-y-6 mt-6 max-w-3xl mx-auto">
      <Card className="dashboard-card">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Food Screenshot</Label>
              <Input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {preview ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                  <img src={preview || "/placeholder.svg"} alt="Food preview" className="h-full w-full object-cover" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 bg-background"
                    onClick={() => {
                      setImage(null)
                      setPreview(null)
                    }}
                  >
                    <span className="sr-only">Remove image</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </Button>
                </div>
              ) : (
                <div
                  ref={dropZoneRef}
                  onClick={handleUploadClick}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 ${
                    isDragging
                      ? "border-primary border-dashed bg-primary/5"
                      : "border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted/80"
                  } transition-colors`}
                >
                  <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
                    <div className={`rounded-full ${isDragging ? "bg-primary/20" : "bg-primary/10"} p-3`}>
                      <ImageIcon className={`h-8 w-8 ${isDragging ? "text-primary" : "text-primary/80"}`} />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-lg font-medium">
                        {isDragging ? "Drop your image here" : "Upload a food screenshot"}
                      </span>
                      <span className="text-sm text-muted-foreground">Drag and drop or click to browse</span>
                    </div>
                    <Button type="button" variant="secondary" onClick={handleUploadClick}>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Image
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <Button type="submit" className="w-full" disabled={!image || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Food"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <FoodResultCard result={result} />
          <Button onClick={handleSaveAndReturn} className="w-full">
            Save and Return to Dashboard
          </Button>
        </div>
      )}
    </div>
  )
}

