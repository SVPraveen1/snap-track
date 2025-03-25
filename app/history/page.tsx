import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { FoodHistoryList } from "@/components/history/food-history-list"

export default async function HistoryPage() {
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
          <h1 className="text-3xl font-bold mb-6">Food History</h1>
          <FoodHistoryList />
        </main>
      </div>
    </div>
  )
}

