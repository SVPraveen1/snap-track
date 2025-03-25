import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { ProfileOverview } from "@/components/profile/profile-overview"

export default async function ProfilePage() {
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
          <h1 className="text-3xl font-bold">Profile Overview</h1>
          <ProfileOverview />
        </main>
      </div>
    </div>
  )
}

