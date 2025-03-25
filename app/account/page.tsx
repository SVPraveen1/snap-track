import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { AccountForm } from "@/components/account/account-form"

export default async function AccountPage() {
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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold mb-8">Account Details</h1>
            <AccountForm />
          </div>
        </main>
      </div>
    </div>
  )
} 