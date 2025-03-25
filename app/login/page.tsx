import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}