"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, PlusCircle, History, BarChart } from "lucide-react"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Add Food",
    href: "/add-food",
    icon: PlusCircle,
  },
  {
    title: "History",
    href: "/history",
    icon: History,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold">Calorimate</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-6 px-4">
        <ul className="space-y-2">
          {sidebarLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

