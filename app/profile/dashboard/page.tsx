import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { CalorieOverview } from "@/components/dashboard/calorie-overview"
import { RecentEntries } from "@/components/dashboard/recent-entries"
import { NutritionInsights } from "@/components/dashboard/nutrition-insights"
import { AddFoodButton } from "@/components/dashboard/add-food-button"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ProfileSidebar />
      <div className="flex-1">
        <ProfileHeader />
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <AddFoodButton />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CalorieOverview className="md:col-span-2" />
            <NutritionInsights />
          </div>
          <RecentEntries />
        </main>
      </div>
    </div>
  )
}

