import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A"  // 🔥 prevents 1970

  const date = new Date(dateString)

  if (isNaN(date.getTime())) return "Invalid Date" // extra safety

  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return formatDate(dateString)
}

export function getDaysUntil(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffInDays
}

export function maskPersonalInfo(text: string): string {
  return text
    .replace(/[\w.-]+@[\w.-]+\.\w+/gi, "***@***.***")
    .replace(/\b\d{10}\b/g, "**********")
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "******* *******")
}
