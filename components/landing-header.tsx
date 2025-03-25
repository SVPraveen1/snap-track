import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Utensils } from "lucide-react"

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1">
              <Utensils className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold">Calorimate</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 mr-4">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
          </nav>
          <ModeToggle />
          <Link href="/login">
            <Button variant="outline">Log in</Button>
          </Link>
          <Link href="/register" className="hidden sm:block">
            <Button>Sign up</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

