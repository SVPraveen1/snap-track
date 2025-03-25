"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { useRouter } from "next/navigation"
import { generatePlan } from "./plan-generator"
import Link from "next/link"

interface UserHealth {
  age: number
  weight: number // in kg
  height: number // in cm
  gender: "male" | "female" | "other"
  activity_level: "sedentary" | "light" | "moderate" | "very_active" | "extra_active"
  goal: "maintain" | "lose" | "gain"
}

interface NutritionGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

const activityMultipliers = {
  sedentary: 1.2, // Little or no exercise
  light: 1.375, // Light exercise 1-3 days/week
  moderate: 1.55, // Moderate exercise 3-5 days/week
  very_active: 1.725, // Very heavy exercise, physical job
  extra_active: 1.9, // Extra heavy exercise, physical job
} as const

const goalMultipliers = {
  lose: 0.8, // 20% deficit
  maintain: 1,
  gain: 1.2, // 20% surplus
}

export function HealthGoals() {
  const [isLoading, setIsLoading] = useState(false)
  const [userHealth, setUserHealth] = useState<UserHealth>({
    age: 0,
    weight: 0,
    height: 0,
    gender: "male",
    activity_level: "moderate",
    goal: "maintain",
  })

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadUserHealth()
  }, [])

  async function loadUserHealth() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("No authenticated user")
      }

      const { data, error } = await supabase
        .from("user_health")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No records found, use default values
          return
        }
        throw error
      }

      if (data) {
        setUserHealth({
          age: data.age,
          weight: data.weight,
          height: data.height,
          gender: data.gender,
          activity_level: data.activity_level,
          goal: data.goal
        })
      }
    } catch (error) {
      console.error("Error loading user health:", error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("No authenticated user")
      }

      // First, delete all existing records for this user
      const { error: deleteError } = await supabase
        .from("user_health")
        .delete()
        .eq("user_id", user.id)

      if (deleteError) throw deleteError

      // Then insert the new record
      const { error: insertError } = await supabase
        .from("user_health")
        .insert([{
          user_id: user.id,
          age: userHealth.age,
          weight: userHealth.weight,
          height: userHealth.height,
          gender: userHealth.gender,
          activity_level: userHealth.activity_level,
          goal: userHealth.goal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (insertError) throw insertError
      
      toast({
        title: "Goals updated",
        description: "Your health information has been updated.",
      })
    } catch (error) {
      console.error("Error saving user health:", error)
      toast({
        title: "Error",
        description: "Failed to save your health information.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGeneratePlan() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("No authenticated user")
      }

      // Check if user has entered actual values
      const isDefaultOrEmpty = 
        !userHealth ||
        userHealth.age === 0 ||
        userHealth.weight === 0 ||
        userHealth.height === 0;

      if (isDefaultOrEmpty) {
        toast({
          title: "Missing Information",
          description: "Please enter your health information before generating a plan.",
          variant: "destructive",
        });
        return;
      }

      // Generate and save new plan
      const plan = generatePlan(userHealth)
      
      const { error } = await supabase
        .from("weekly_plans")
        .upsert([{
          user_id: user.id,
          plan: plan,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (error) throw error

      toast({
        title: "Plan Generated",
        description: "Your personalized weekly plan is ready!",
      })

      router.push("/weekly-plan")
    } catch (error) {
      console.error("Error generating plan:", error)
      toast({
        title: "Error",
        description: "Failed to generate your plan. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={userHealth.age || ""}
                  onChange={(e) => setUserHealth({ ...userHealth, age: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={userHealth.weight || ""}
                  onChange={(e) => setUserHealth({ ...userHealth, weight: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={userHealth.height || ""}
                  onChange={(e) => setUserHealth({ ...userHealth, height: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={userHealth.gender}
                  onValueChange={(value: "male" | "female" | "other") => setUserHealth({ ...userHealth, gender: value })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Activity Level</Label>
                <Select
                  value={userHealth.activity_level}
                  onValueChange={(value: any) => setUserHealth({ ...userHealth, activity_level: value })}
                >
                  <SelectTrigger id="activity">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (intense exercise daily)</SelectItem>
                    <SelectItem value="extra_active">Extra Active (intense exercise daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Goal</Label>
                <Select
                  value={userHealth.goal}
                  onValueChange={(value: any) => setUserHealth({ ...userHealth, goal: value })}
                >
                  <SelectTrigger id="goal">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Lose Weight</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="gain">Gain Weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Information"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Plan</CardTitle>
          <CardDescription>
            Generate a personalized workout and nutrition plan based on your goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGeneratePlan}
            className="w-full"
            disabled={!userHealth || isLoading}
          >
            Generate Weekly Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 