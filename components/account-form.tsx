"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const userInfoSchema = z.object({
  age: z.number().min(13).max(120),
  weight: z.number().min(30).max(300),
  height: z.number().min(100).max(250),
  gender: z.enum(["male", "female"]),
  activity_level: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["maintain", "lose", "gain"]),
})

type UserInfoValues = z.infer<typeof userInfoSchema>

export function AccountForm() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [userInfo, setUserInfo] = useState<UserInfoValues | null>(null)

  const form = useForm<UserInfoValues>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: userInfo || {
      age: 0,
      weight: 0,
      height: 0,
      gender: "male",
      activity_level: "moderate",
      goal: "maintain",
    },
  })

  useEffect(() => {
    async function loadUserHealth() {
      try {
        const response = await fetch("/api/user/health")
        if (response.ok) {
          const data = await response.json()
          setUserInfo(data)
          form.reset(data)
        }
      } catch (error) {
        console.error("Error loading user health:", error)
      }
    }

    if (session) {
      loadUserHealth()
    }
  }, [session, form])

  async function onSubmit(data: UserInfoValues) {
    try {
      const response = await fetch("/api/user/health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update user information")
      }

      const updatedInfo = await response.json()
      setUserInfo(updatedInfo)
      toast({
        title: "Success",
        description: "Your information has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your information. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your basic account information from your login provider.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-lg">{session?.user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-lg">{session?.user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health Information</CardTitle>
          <CardDescription>Your health details and fitness goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activity_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="very_active">Very Active</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="maintain">Maintain Weight</SelectItem>
                          <SelectItem value="lose">Lose Weight</SelectItem>
                          <SelectItem value="gain">Gain Weight</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="mt-6">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 