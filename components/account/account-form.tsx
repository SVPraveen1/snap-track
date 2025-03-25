"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
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
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil } from "lucide-react"

const userProfileSchema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
})

type UserProfileValues = z.infer<typeof userProfileSchema>

type UserHealthInfo = {
  age: number
  weight: number
  height: number
  gender: string
  activity_level: string
  goal: string
}

export function AccountForm() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [userHealth, setUserHealth] = useState<UserHealthInfo | null>(null)
  const [profileData, setProfileData] = useState<UserProfileValues | null>(null)

  const form = useForm<UserProfileValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      display_name: session?.user?.name || "",
      email: session?.user?.email || "",
      birthday: "",
      phone_number: "",
    },
  })

  useEffect(() => {
    async function loadUserData() {
      try {
        // Load profile data
        const profileResponse = await fetch("/api/user/profile")
        if (profileResponse.ok) {
          const data = await profileResponse.json()
          setProfileData(data)
          form.reset(data)
        }

        // Load health data
        const healthResponse = await fetch("/api/user/health")
        if (healthResponse.ok) {
          const healthData = await healthResponse.json()
          setUserHealth(healthData)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }

    if (session) {
      loadUserData()
    }
  }, [session, form])

  async function onSubmit(data: UserProfileValues) {
    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      setProfileData(data)
      setIsEditing(false)
      
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const month = date.toLocaleString('default', { month: 'long' })
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal information.</CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthday</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4">
                  <Button type="submit">Save Changes</Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      form.reset(profileData || undefined)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-[120px_1fr] items-center">
                  <div className="font-medium">Name</div>
                  <div>{profileData?.display_name}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center">
                  <div className="font-medium">Email</div>
                  <div>{profileData?.email}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center">
                  <div className="font-medium">Birthday</div>
                  <div>
                    {profileData?.birthday ? formatDate(profileData.birthday) : "Not set"}
                  </div>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center">
                  <div className="font-medium">Phone Number</div>
                  <div>{profileData?.phone_number || "Not set"}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Health Goals</CardTitle>
            <CardDescription>Your current health details and fitness goals.</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/goals">Update Goals</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {userHealth ? (
            <div className="grid grid-cols-[120px_1fr] gap-4">
              <div className="font-medium">Age</div>
              <div>{userHealth.age} years</div>
              <div className="font-medium">Weight</div>
              <div>{userHealth.weight} kg</div>
              <div className="font-medium">Height</div>
              <div>{userHealth.height} cm</div>
              <div className="font-medium">Gender</div>
              <div className="capitalize">{userHealth.gender}</div>
              <div className="font-medium">Activity Level</div>
              <div className="capitalize">{userHealth.activity_level.replace('_', ' ')}</div>
              <div className="font-medium">Goal</div>
              <div className="capitalize">{userHealth.goal} weight</div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No health information available.</p>
              <Button variant="outline" asChild className="mt-4">
                <Link href="/goals">Set Goals</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 