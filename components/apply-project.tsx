"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UsersIcon } from "@heroicons/react/24/outline"
import { useUser } from "@/contexts/UserContext"

interface ApplyProjectTeamProps {
  projectId: string
  onSuccess?: (groupStatus: { status: "PENDING"; group_name: string; is_leader: boolean }) => void
}

export default function ApplyProjectTeam({ projectId, onSuccess }: ApplyProjectTeamProps) {
  const { user: currentUser } = useUser()
  const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "")

  const [teams, setTeams] = useState<any[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const fetchLeaderTeams = async () => {
      if (!currentUser?.id) return
      try {
        const res = await fetch(
          `${backendBase}/api/team-builder/get-teams-by-Leader/${currentUser.id}`,
          { credentials: "include" }
        )
        if (res.ok) {
          const data = await res.json()
          setTeams(data.teams || [])
        }
      } catch (err) {
        console.error("Failed to fetch leader teams:", err)
      } finally {
        setIsLoadingTeams(false)
      }
    }
    fetchLeaderTeams()
  }, [currentUser?.id])

  const handleApply = async () => {
    if (!selectedGroupId) return
    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const res = await fetch(`${backendBase}/api/project-group/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ project_id: projectId, group_id: selectedGroupId }),
      })

      const data = await res.json()

      if (res.ok) {
        const selectedTeam = teams.find((t) => String(t.id) === String(selectedGroupId))
        // Bubble up to parent so it switches to status view immediately
        onSuccess?.({
          status: "PENDING",
          group_name: selectedTeam?.name || `Group #${selectedGroupId}`,
          is_leader: true,
        })
      } else {
        setErrorMessage(data.error || "Application failed. Please try again.")
      }
    } catch {
      setErrorMessage("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Not a leader — they have no groups to lead
  if (!isLoadingTeams && teams.length === 0) {
    return (
      <div className="py-4 text-center space-y-2">
        <UsersIcon className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Cannot Apply</p>
        <p className="text-xs text-muted-foreground leading-snug">
          Only group leaders can apply for academic projects.
          Create a group in the Team Builder to apply.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4 border-t border-border/50">
      <div className="flex items-center gap-2">
        <UsersIcon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Apply as a Team</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="groupSelect" className="text-xs text-muted-foreground">
          Select Your Team
        </Label>

        {isLoadingTeams ? (
          <div className="h-10 bg-muted animate-pulse rounded-md" />
        ) : (
          <select
            id="groupSelect"
            value={selectedGroupId}
            onChange={(e) => {
              setSelectedGroupId(e.target.value)
              setErrorMessage("")
            }}
            className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">— Choose a team —</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.members.length} member{team.members.length !== 1 ? "s" : ""})
              </option>
            ))}
          </select>
        )}

        <p className="text-[10px] text-muted-foreground leading-tight">
          All team members must meet the minimum CGPA requirements.
        </p>
      </div>

      <Button
        className="w-full"
        disabled={isSubmitting || !selectedGroupId}
        onClick={handleApply}
        size="lg"
      >
        {isSubmitting ? "Verifying..." : "Submit Application"}
      </Button>

      {errorMessage && (
        <p className="text-xs text-destructive text-center">{errorMessage}</p>
      )}
    </div>
  )
}
// ```

// ---

// ### Summary of the full flow
// ```
// Student lands on project page
//         │
//         ▼
// fetch /my-group-status
//         │
//    ┌────┴────┐
//  data=null  data exists
//    │            │
//    ▼            ▼
// ApplyProjectTeam   ProjectApplicationStatus
//    │                  (shows PENDING/ACCEPTED/REJECTED)
//    ├─ has led groups → dropdown + submit
//    │      └─ on success → onSuccess() → switches to status view
//    │
//    └─ no led groups → "Only leaders can apply" message