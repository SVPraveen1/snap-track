import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { RegisterForm } from "@/components/auth/register-form"

export default async function RegisterPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  )
}

