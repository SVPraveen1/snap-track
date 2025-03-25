import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { CalorieOverview } from "@/components/dashboard/calorie-overview"
import { RecentEntries } from "@/components/dashboard/recent-entries"
import { NutritionInsights } from "@/components/dashboard/nutrition-insights"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <Button asChild>
              <Link href="/add-food" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Food
              </Link>
            </Button>
          </div>
          <CalorieOverview />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <RecentEntries />
            <NutritionInsights />
          </div>
        </main>
      </div>
    </div>
  )
}

