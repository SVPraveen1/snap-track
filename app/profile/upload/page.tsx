import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { ScreenshotUploadForm } from "@/components/profile/screenshot-upload-form"

export default async function UploadPage() {
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
          <h1 className="text-3xl font-bold">Upload Food Screenshot</h1>
          <p className="text-muted-foreground">
            Take a screenshot of your meal or food and our AI will analyze it to provide nutritional information.
          </p>
          <ScreenshotUploadForm />
        </main>
      </div>
    </div>
  )
}

