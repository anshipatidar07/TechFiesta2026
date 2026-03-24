// components/project-application-status.tsx
"use client"

import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline"

interface Props {
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  groupName: string
  isLeader: boolean
}

const statusConfig = {
  PENDING: {
    icon: ClockIcon,
    iconClass: "text-yellow-500",
    label: "Application Pending",
    description: "Your application is under review.",
    badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  ACCEPTED: {
    icon: CheckCircleIcon,
    iconClass: "text-green-600",
    label: "Application Accepted",
    description: "Congratulations! Your group has been accepted.",
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  REJECTED: {
    icon: XCircleIcon,
    iconClass: "text-red-500",
    label: "Application Rejected",
    description: "Unfortunately, your group was not selected.",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
}

export default function ProjectApplicationStatus({ status, groupName, isLeader }: Props) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="space-y-3 text-center py-2">
      <Icon className={`mx-auto h-10 w-10 ${config.iconClass}`} />
      <div>
        <p className="font-semibold text-foreground">{config.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
      </div>
      <div className="flex flex-col gap-1.5 items-center">
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${config.badgeClass}`}>
          {status}
        </span>
        <span className="text-xs text-muted-foreground">
          Group Name: <span className="font-medium text-foreground">{groupName}</span>
        </span>
       
      </div>
    </div>
  )
}