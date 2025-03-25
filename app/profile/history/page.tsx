import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { FoodHistoryList } from "@/components/history/food-history-list"

export default async function HistoryPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ProfileSidebar />
      <div className="flex-1">
        <ProfileHeader />
        <main className="p-6">
          <h1 className="text-3xl font-bold mb-6">Food History</h1>
          <FoodHistoryList />
        </main>
      </div>
    </div>
  )
}

