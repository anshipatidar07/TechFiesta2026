"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CheckCircleIcon, UsersIcon } from "@heroicons/react/24/outline"
import { useUser } from "@/contexts/UserContext"

interface ApplyProjectTeamProps {
  projectId: string;
  teacherId: string;
}

export default function ApplyProjectTeam({ projectId, teacherId }: ApplyProjectTeamProps) {
  const { user: currentUser } = useUser()
  const [teams, setTeams] = useState<any[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  // Fetch all teams where the current user is the leader
  useEffect(() => {
    const fetchLeaderTeams = async () => {
      if (!currentUser?.id) return
      try {
        const response = await fetch(
          `http://localhost:5000/api/team-builder/get-teams-by-Leader/${currentUser.id}`,
          { credentials: "include" }
        )
        if (response.ok) {
          const data = await response.json()
          setTeams(data.teams || [])
        }
      } catch (error) {
        console.error("Failed to fetch leader teams:", error)
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
      const response = await fetch(`http://localhost:5000/api/projects/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          project_id: projectId,
          group_id: selectedGroupId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
      } else {
        setErrorMessage(data.error || "Application failed. Please try again.")
        setStatus("error")
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.")
      setStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'success') {
    return (
      <div className="py-4 text-center">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600 mb-2" />
        <p className="font-medium text-foreground">Application Submitted</p>
        <p className="text-sm text-muted-foreground">Your team is now associated with this project.</p>
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
        ) : teams.length === 0 ? (
          <div className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-md px-3 py-2">
            You are not a leader of any team. Create a team first in the Team Builder.
          </div>
        ) : (
          <select
            id="groupSelect"
            value={selectedGroupId}
            onChange={(e) => {
              setSelectedGroupId(e.target.value)
              setStatus("idle")
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
        disabled={isSubmitting || !selectedGroupId || teams.length === 0}
        onClick={handleApply}
        size="lg"
      >
        {isSubmitting ? "Verifying..." : "Submit Application"}
      </Button>

      {status === 'error' && (
        <p className="text-xs text-destructive text-center">
          {errorMessage || "Invalid team or criteria not met."}
        </p>
      )}
    </div>
  )
}