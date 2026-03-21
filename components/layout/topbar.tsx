"use client"

import { BellIcon, UserCircleIcon, Bars3Icon, MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAppStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import { logoutUser } from "@/lib/auth"

type TopbarProps = {
  onMenuClick?: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { notifications } = useAppStore()
  const unreadCount = notifications.filter((n) => !n.read).length
  
  const { user, loading, error } = useUser()

  // Ensure component is mounted before rendering theme-dependent content
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await logoutUser(null)
    } finally {
      router.replace("/auth/login")
      router.refresh()
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="glass sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Bars3Icon className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
        <div className="relative max-w-md w-full">
          {/* <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search opportunities, students..."
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          /> */}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {mounted && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="relative h-9 w-9 p-0 transition-transform hover:scale-110"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <SunIcon className="h-6 w-6 text-foreground rotate-0 scale-100 transition-all duration-300" />
            ) : (
              <MoonIcon className="h-6 w-6 text-foreground rotate-0 scale-100 transition-all duration-300" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}
        <Link href="/notifications" className="relative">
          <BellIcon className="h-6 w-6 text-foreground hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Link>

        <div className="flex items-center gap-2 border-l border-border pl-3 sm:gap-3 sm:pl-4">
          <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="hidden sm:inline-flex">
            {isLoggingOut ? "Signing out..." : "Logout"}
          </Button>
          <div className="hidden text-right md:block">
            <div className="text-sm font-medium text-foreground">
              {loading ? "Loading..." : error ? "Guest User" : user?.username || "Guest User"}
            </div>
            <div className="text-xs text-muted-foreground">
              {loading ? "..." : error ? "guest@example.com" : user?.email || "guest@example.com"}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="hidden h-11 w-11 p-0 sm:inline-flex"
            onClick={() => router.push("/profile")}
          >
            <UserCircleIcon className="h-10 w-10 text-muted-foreground" />
            <span className="sr-only">Open profile</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 p-0 sm:hidden [&_svg]:size-6">
                <UserCircleIcon className="size-6 text-muted-foreground" />
                <span className="sr-only">Open profile menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {loading ? "Loading..." : error ? "Guest User" : user?.username || "Guest User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {loading ? "..." : error ? "guest@example.com" : user?.email || "guest@example.com"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? "Signing out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
