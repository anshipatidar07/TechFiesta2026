"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { UserProvider } from "@/contexts/UserContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <UserProvider>
      <div className="flex min-h-dvh overflow-hidden bg-background">
       <div className="hidden md:block sticky top-0 h-dvh">
  <Sidebar />
</div>

        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-out md:hidden ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>
    </UserProvider>
  )
}
