"use client"

import type { ComponentType, SVGProps } from "react"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import {
  HomeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BellIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  UsersIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline"

type SidebarProps = {
  onNavigate?: () => void
}

type NavItem = {
  name: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { currentRole } = useAppStore()
  const { user } = useUser()
  const activeRole = user?.role ?? currentRole

  const navigation: Record<string, NavItem[]> = {
    student: [
      { name: "Dashboard", href: "/dashboard/student", icon: HomeIcon },
      { name: "Opportunities", href: "/opportunities", icon: BriefcaseIcon },
      { name: "My Applications", href: "/applications", icon: DocumentTextIcon },
      { name: "Team Builder", href: "/team-builder", icon: UserGroupIcon },
      { name: "Recommendations", href: "/recommendations", icon: AcademicCapIcon },
      { name: "Notifications", href: "/notifications", icon: BellIcon },
      { name: "Project Progress", href: "/project-progress/student", icon: ArrowTrendingUpIcon },
    ],
    tnp: [
      { name: "Dashboard", href: "/dashboard/tnp", icon: HomeIcon },
      { name: "Opportunities", href: "/opportunities", icon: BriefcaseIcon },
      { name: "Post Opportunity", href: "/post-opportunity", icon: PlusIcon },
      { name: "Bulk Upload", href: "/bulk-upload", icon: ArrowUpTrayIcon },
      { name: "Students", href: "/resumes", icon: UsersIcon },
      { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
    ],
    teacher: [
      { name: "Dashboard", href: "/dashboard/teacher", icon: HomeIcon },
      { name: "Opportunities", href: "/opportunities", icon: BriefcaseIcon },
      { name: "Post Opportunity", href: "/post-opportunity", icon: PlusIcon },
      { name: "Students", href: "/resumes", icon: UsersIcon },
      { name: "Project Progress", href: "/project-progress/teacher", icon: ArrowTrendingUpIcon },
    ],
    recruiter: [
      { name: "Dashboard", href: "/dashboard/recruiter", icon: HomeIcon },
      { name: "Opportunities", href: "/opportunities", icon: BriefcaseIcon },
      // { name: "Students", href: "/resumes", icon: UsersIcon },
      // { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
    ],
  }

  const links = navigation[activeRole] || navigation.student

  return (
  <div className="flex h-full w-64 max-w-[85vw] flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <AcademicCapIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">Katana</span>
            <span className="text-xs text-muted-foreground capitalize">{activeRole}</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4" />
    </div>
  )
}
