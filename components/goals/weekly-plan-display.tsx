"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { generatePlan, WeeklyPlan } from "./plan-generator"

interface WeeklyPlanDisplayProps {
  plan: WeeklyPlan
}

export function WeeklyPlanDisplay({ plan }: WeeklyPlanDisplayProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Plan - Daily Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Daily Calories</div>
              <div className="text-2xl font-bold">{plan.nutritionPlan.dailyCalories}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Protein</div>
              <div className="text-2xl font-bold">{plan.nutritionPlan.macros.protein}g</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Carbs</div>
              <div className="text-2xl font-bold">{plan.nutritionPlan.macros.carbs}g</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Fat</div>
              <div className="text-2xl font-bold">{plan.nutritionPlan.macros.fat}g</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Workout Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(plan.workoutPlan).map(([day, workout]) => (
              <div key={day} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2 capitalize">{day}</h3>
                {workout.exercises.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Exercises:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {workout.exercises.map((exercise, index) => (
                        <li key={index}>
                          {exercise.name} - {exercise.sets} sets × {exercise.reps}
                          {exercise.notes && <span className="text-sm text-muted-foreground"> ({exercise.notes})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {workout.cardio && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Cardio:</h4>
                    <p>{workout.cardio}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1">
            {plan.nutritionPlan.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 