"use client"

import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
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
} from "@heroicons/react/24/outline"

export function Sidebar() {
  const pathname = usePathname()
  const { currentRole } = useAppStore()

  const roleDashboardMap: Record<string, string> = {
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  tnp: "/dashboard/tnp",
  recruiter: "/dashboard/recruiter",
}

   const router = useRouter()

  const navigation = {
    student: [
      { name: "Dashboard", href: "/dashboard/student", icon: HomeIcon },
      { name: "Opportunities", href: "/opportunities", icon: BriefcaseIcon },
      { name: "My Applications", href: "/applications", icon: DocumentTextIcon },
      { name: "Team Builder", href: "/team-builder", icon: UserGroupIcon },
      { name: "Recommendations", href: "/recommendations", icon: AcademicCapIcon },
      { name: "Notifications", href: "/notifications", icon: BellIcon },
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
    ],
    recruiter: [
      { name: "Dashboard", href: "/dashboard/recruiter", icon: HomeIcon },
      { name: "Opportunities", href: "/opportunities", icon: BriefcaseIcon },
      { name: "Students", href: "/resumes", icon: UsersIcon },
      { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
    ],
  }

  const links = navigation[currentRole] || navigation.student

  return (
    <div className="glass-strong flex h-screen w-64 flex-col border-r border-border">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <AcademicCapIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">Campus Portal</span>
            <span className="text-xs text-muted-foreground capitalize">{currentRole}</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
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

      <div className="border-t border-border p-4">
     <select
  value={currentRole}
  onChange={(e) => {
    const role = e.target.value as
      | "student"
      | "teacher"
      | "tnp"
      | "recruiter"

    useAppStore.setState({ currentRole: role })
    router.push(`/dashboard/${role}`)
  }}
  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
>
  <option value="student">Student View</option>
  <option value="tnp">TnP View</option>
  <option value="teacher">Teacher View</option>
  <option value="recruiter">Recruiter View</option>
</select>
      </div>
    </div>
  )
}
