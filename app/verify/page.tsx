import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent you an email with a verification link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">Please check your email inbox for instructions to verify your account.</p>
              <p className="mb-4">If you don't see the email, check your spam folder.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  I've verified my email, take me to login
                </Button>
              </Link>
              <Link href="mailto:support@yourapp.com">
                <Button variant="link" className="w-full">
                  Didn't receive the email? Contact support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 