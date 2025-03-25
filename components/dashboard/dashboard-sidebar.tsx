"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  BarChart2,
  Target 
} from "lucide-react"

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-xl font-semibold tracking-tight">SnapTrack</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto">
        <nav className="grid items-start px-4 py-4">
          <Link href="/dashboard">
            <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} 
              className="w-full justify-start gap-2 font-normal">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/add-food">
            <Button variant={pathname === "/add-food" ? "secondary" : "ghost"} 
              className="w-full justify-start gap-2 font-normal">
              <PlusCircle className="h-4 w-4" />
              Add Food
            </Button>
          </Link>
          <Link href="/history">
            <Button variant={pathname === "/history" ? "secondary" : "ghost"} 
              className="w-full justify-start gap-2 font-normal">
              <History className="h-4 w-4" />
              History
            </Button>
          </Link>
          <Link href="/goals">
            <Button variant={pathname === "/goals" ? "secondary" : "ghost"} 
              className="w-full justify-start gap-2 font-normal">
              <Target className="h-4 w-4" />
              Goals
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant={pathname === "/reports" ? "secondary" : "ghost"} 
              className="w-full justify-start gap-2 font-normal">
              <BarChart2 className="h-4 w-4" />
              Reports
            </Button>
          </Link>
        </nav>
      </div>
    </div>
  )
}

