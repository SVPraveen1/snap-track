"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function AddFoodButton() {
  return (
    <Link href="/profile/upload">
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Food
      </Button>
    </Link>
  )
}

