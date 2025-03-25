"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface UserPreferences {
  daily_calorie_goal: number
  daily_protein_goal: number
  daily_carbs_goal: number
  daily_fat_goal: number
  reminder_enabled: boolean
  reminder_time: string
}

export function UserPreferencesForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    daily_calorie_goal: 2000,
    daily_protein_goal: 50,
    daily_carbs_goal: 250,
    daily_fat_goal: 70,
    reminder_enabled: false,
    reminder_time: "19:00",
  })

  const { toast } = useToast()

  useEffect(() => {
    async function fetchPreferences() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/user/preferences")
        const data = await response.json()

        if (data.success) {
          setPreferences(data.preferences)
        }
      } catch (error) {
        console.error("Error fetching preferences:", error)
        toast({
          title: "Error",
          description: "Failed to load your preferences",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreferences()
  }, [toast])

  function handleChange(field: keyof UserPreferences, value: string | number | boolean) {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setIsSaving(true)

    try {
      const response = await fetch("/api/user/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Preferences saved",
          description: "Your preferences have been updated successfully",
        })
      } else {
        throw new Error(data.error || "Failed to save preferences")
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save your preferences",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Preferences</CardTitle>
        <CardDescription>Customize your nutrition goals and app settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Nutrition Goals</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="daily-calorie-goal">Daily Calorie Goal</Label>
                <Input
                  id="daily-calorie-goal"
                  type="number"
                  min="1000"
                  max="10000"
                  value={preferences.daily_calorie_goal}
                  onChange={(e) => handleChange("daily_calorie_goal", Number.parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily-protein-goal">Daily Protein Goal (g)</Label>
                <Input
                  id="daily-protein-goal"
                  type="number"
                  min="0"
                  max="500"
                  value={preferences.daily_protein_goal}
                  onChange={(e) => handleChange("daily_protein_goal", Number.parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily-carbs-goal">Daily Carbs Goal (g)</Label>
                <Input
                  id="daily-carbs-goal"
                  type="number"
                  min="0"
                  max="1000"
                  value={preferences.daily_carbs_goal}
                  onChange={(e) => handleChange("daily_carbs_goal", Number.parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily-fat-goal">Daily Fat Goal (g)</Label>
                <Input
                  id="daily-fat-goal"
                  type="number"
                  min="0"
                  max="500"
                  value={preferences.daily_fat_goal}
                  onChange={(e) => handleChange("daily_fat_goal", Number.parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Reminders</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminder-enabled">Daily Reminder</Label>
                <p className="text-sm text-muted-foreground">Receive a daily reminder to log your meals</p>
              </div>
              <Switch
                id="reminder-enabled"
                checked={preferences.reminder_enabled}
                onCheckedChange={(checked) => handleChange("reminder_enabled", checked)}
              />
            </div>

            {preferences.reminder_enabled && (
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder Time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={preferences.reminder_time}
                  onChange={(e) => handleChange("reminder_time", e.target.value)}
                />
              </div>
            )}
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

