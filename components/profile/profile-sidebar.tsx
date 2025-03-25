"use client"

import { ProfileSidebarContent } from "@/components/profile/profile-sidebar-content"

export function ProfileSidebar() {
  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
      <ProfileSidebarContent />
    </aside>
  )
}

