"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Clock, Award, TrendingUp, Upload } from "lucide-react"
import Link from "next/link"

export function ProfileOverview() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    daysActive: 0,
    entriesLogged: 0,
    streakDays: 0,
    caloriesTracked: 0,
  })

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    setStats({
      daysActive: 14,
      entriesLogged: 42,
      streakDays: 7,
      caloriesTracked: 28500,
    })
  }, [])

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Profile Overview</h2>
      </div>
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
              <p className="text-muted-foreground">{session?.user?.email}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Button size="sm" asChild>
                  <Link href="/profile/upload">Upload Screenshot</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stats-card">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <CalendarDays className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">{stats.daysActive}</p>
            <p className="text-sm text-muted-foreground">Days Active</p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Clock className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">{stats.entriesLogged}</p>
            <p className="text-sm text-muted-foreground">Entries Logged</p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Award className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">{stats.streakDays}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">{stats.caloriesTracked.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Calories Tracked</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest food tracking activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Logged breakfast</p>
                    <p className="text-sm text-muted-foreground">Today at 8:30 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Uploaded food screenshot</p>
                    <p className="text-sm text-muted-foreground">Yesterday at 1:15 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Earned 7-day streak badge</p>
                    <p className="text-sm text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="achievements" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Badges and milestones you've earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium text-center">7-Day Streak</p>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium text-center">30 Entries</p>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg opacity-50">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-2">
                    <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-center">30-Day Streak</p>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg opacity-50">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-2">
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-center">50,000 Calories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

