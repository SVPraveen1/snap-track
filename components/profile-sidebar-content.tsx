"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { User, LayoutDashboard, Upload, History, BarChart, Utensils } from "lucide-react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const sidebarLinks = [
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Dashboard",
    href: "/profile/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Upload Screenshot",
    href: "/profile/upload",
    icon: Upload,
  },
  {
    title: "Food History",
    href: "/profile/history",
    icon: History,
  },
  {
    title: "Reports",
    href: "/profile/reports",
    icon: BarChart,
  },
]

export function ProfileSidebarContent() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  return (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/profile" className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-1">
            <Utensils className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold">Calorimate</span>
        </Link>
      </div>
      <div className="flex flex-col items-center py-6 border-b">
        <Avatar className="h-20 w-20 mb-2">
          <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
          <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-medium">{session?.user?.name}</h2>
        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
      </div>
      <nav className="flex-1 overflow-auto py-6 px-4">
        <ul className="space-y-2">
          {sidebarLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname === link.href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

