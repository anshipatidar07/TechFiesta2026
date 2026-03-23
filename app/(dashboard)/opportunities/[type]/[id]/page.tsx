"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkillBadge } from "@/components/ui/skill-badge"
import { ArrowLeftIcon, CheckCircleIcon, UsersIcon, EnvelopeIcon } from "@heroicons/react/24/outline"
import { formatDate, getDaysUntil } from "@/lib/utils"
import { calculateMatchScore } from "@/lib/mock-data"
import ApplyProjectTeam from "@/components/apply-project"
import { useUser } from "@/contexts/UserContext"

export default function OpportunityDetailPage() {
  const params = useParams()
  const type = params.type as string
  const id = params.id as string
  const router = useRouter()

  const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "")
  const { currentUser, addNotification } = useAppStore()
  const { user, loading: userLoading } = useUser()

  const [opportunity, setOpportunity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
 const [appliedGroups, setAppliedGroups] = useState<any[]>([])

  const isStaff = ["tnp", "recruiter", "teacher"].includes(user?.username?.toLowerCase() || "")
  const isStudent = user?.username === "student" || user?.username === "anshi_student"

  useEffect(() => {
    const fetchOpportunity = async () => {


      setLoading(true)
      setError(null)

      
      if (type === "project" && isStaff) {
        const groupsRes = await fetch(`${backendBase}/api/project-group/${id}/groups`)
        const groupsData = await groupsRes.json()
      if (groupsRes.ok) setAppliedGroups(groupsData.data || [])
      }

      try {
        let url = ""
        if (type === "internship") {
          url = `${backendBase}/api/internships/${id}`
        } else if (type === "project") {
          url = `${backendBase}/api/academic-project/${id}`
        } else {
          throw new Error("Invalid opportunity type")
        }

        const res = await fetch(url)
        if (!res.ok) throw new Error("Failed to fetch opportunity")
        const resData = await res.json()
const data = resData.data 
        console.log("The data is: ",data)

        if (type === "internship") {
          setOpportunity({
            id: data.id,
            title: data.title,
            company: data.company || "Unknown",
            type: "internship",
            description: data.description,
            skills: Array.isArray(data.skills) ? data.skills : data.skills?.split(",") || [],
            postedDate: data.posted_date,
            deadline: data.deadline,
            stipend: data.stipend,
            duration: data.duration,
            applicants: data.applicants || 0,
            postedBy: data.postedBy?.first_name || "Unknown",
            applications: data.applications || [],
          })
        } else {
          setOpportunity({
             id: (data.project_id ?? data.id ?? data._id ?? "").toString(), 
            title: data.title,
            company: "Academic Project",
            type: "project",
            description: data.description,
            skills: data.technology_stack?.split(",") || [],
           postedDate: data.created_at ?? data.posted_date ?? null,
            deadline: data.deadline ?? null,
            stipend: "Academic Credit",
            duration: data.academic_year,
            applicants: data._count?.groups || 0,
            postedBy: data.supervisor?.first_name || "Unknown",
            applications: [],
          })
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (type && id) fetchOpportunity()
  }, [type, id, user])

  // Effect 2: fetch groups only after both opportunity and user are ready
useEffect(() => {
  const fetchGroups = async () => {
    if (!opportunity || !isStaff || opportunity.type !== "project") return
    try {
      const groupsRes = await fetch(`${backendBase}/api/academic-project/${opportunity.id}/groups`)
      const groupsData = await groupsRes.json()
      if (groupsRes.ok) setAppliedGroups(groupsData.data || [])
    } catch (err) {
      console.error("Failed to fetch groups:", err)
    }
  }
  fetchGroups()
}, [opportunity, user]) 

  if (loading || userLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !opportunity) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error || "Opportunity not found"}</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    )
  }

  const hasApplied = opportunity.applications?.some(
    (app: any) => app.student?.user_id === user?.id
  )
  const isPlaced = opportunity?.applications?.some(
    (app: any) => app?.student?.user_id === user?.id && app?.status === "SELECTED"
  ) || false

  const matchScore = currentUser && Array.isArray(opportunity.skills)
    ? calculateMatchScore(currentUser.skills || [], opportunity.skills)
    : 0

  const daysLeft = getDaysUntil(opportunity.deadline)
  const isDeadlinePassed = daysLeft <= 0

  const handleApply = async () => {
    if (!user) return
    setIsApplying(true)
    try {
      const response = await fetch(`${backendBase}/api/internships/${opportunity.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Failed to apply")

      setOpportunity((prev: any) => ({
        ...prev,
        applicants: prev.applicants + 1,
        applications: [
          ...(prev.applications || []),
          { id: `temp-${Date.now()}`, status: "APPLIED", student: { user_id: user.id } }
        ]
      }))

      addNotification({
        id: `N${Date.now()}`,
        title: "Application Submitted",
        message: `Your application for ${opportunity.title} has been submitted successfully!`,
        type: "success",
        read: false,
        timestamp: new Date().toISOString(),
      })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsApplying(false)
    }
  }

  const handleSelect = async (applicationId: string) => {
    try {
      await fetch(`${backendBase}/api/internships/applications/${applicationId}/select`, {
        method: "PUT",
      })
      setOpportunity((prev: any) => ({
        ...prev,
        applications: prev.applications.map((app: any) =>
          app.id === applicationId ? { ...app, status: "SELECTED" } : app
        ),
      }))
    } catch {
      alert("Failed to select student")
    }
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => router.back()} variant="ghost" size="sm">
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass rounded-2xl p-6">
            <div className="mb-4">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground">{opportunity.title}</h1>
                  <p className="mt-1 text-lg text-muted-foreground">{opportunity.company}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                  opportunity.type === "internship"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                }`}>
                  {opportunity.type}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="mb-2 font-semibold text-foreground">Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {opportunity.description}
                </p>
              </div>

              <div>
                <h2 className="mb-2 font-semibold text-foreground">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(opportunity.skills) && opportunity.skills.map((skill: string) => {
                    const isMatched = currentUser?.skills?.some(
                      (s: string) => s.toLowerCase().includes(skill.toLowerCase()) ||
                        skill.toLowerCase().includes(s.toLowerCase())
                    )
                    return <SkillBadge key={skill} skill={skill} variant={isMatched ? "matched" : "default"} />
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Staff: Applicants Table */}
          {isStaff && opportunity.type === "project" && (
  <Card className="glass rounded-2xl p-6 border-primary/20 bg-primary/5">
    <div className="flex items-center gap-2 mb-4">
      <UsersIcon className="h-6 w-6 text-primary" />
      <h2 className="text-xl font-bold text-primary">
        Applied Groups ({appliedGroups.length})
      </h2>
    </div>

    {appliedGroups.length > 0 ? (
      <div className="space-y-4">
        {appliedGroups.map((group) => (
          <div key={group.group_id} className="rounded-lg border border-border bg-background/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">
                {group.group_name || `Group #${group.group_id}`}
              </h3>
              <span className="text-xs text-muted-foreground">
                {group.member_count} member(s)
              </span>
            </div>

            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-secondary-foreground border-b border-border">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Dept</th>
                  <th className="px-3 py-2 font-medium">CGPA</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {group.members.map((member:any) => (
                  <tr key={member.registration_number} className="hover:bg-muted/50 transition-colors">
                    <td className="px-3 py-3 font-medium text-foreground whitespace-nowrap">
                      {member.first_name} {member.last_name}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                      <a href={`mailto:${member.primary_email}`} className="hover:text-primary transition-colors">
                        {member.primary_email}
                      </a>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{member.department || "N/A"}</td>
                    <td className="px-3 py-3 font-bold text-foreground">{member.cgpa ?? "N/A"}</td>
                    <td className="px-3 py-3">
                      {group.leader?.registration_number === member.registration_number ? (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Leader
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Member</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-background/50">
        <p className="text-muted-foreground">No groups have applied yet.</p>
      </div>
    )}
  </Card>
)}

          {/* Student: Application Timeline */}
          {isStudent && hasApplied && (
            <Card className="glass rounded-2xl p-6">
              <h2 className="mb-6 text-xl font-semibold text-foreground">Application Timeline</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />
                <div className="relative flex items-start gap-4 pl-10">
                  <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary">
                    <CheckCircleIcon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 pb-4">
                    <h3 className="font-semibold text-foreground">Applied Successfully</h3>
                    <p className="text-sm text-muted-foreground">Your profile has been sent to the recruiter.</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="glass rounded-2xl p-6">
            {isStudent && currentUser && (
              <div className="mb-4 text-center">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">{matchScore}%</span>
                </div>
                <p className="text-sm text-muted-foreground">Your Match Score</p>
              </div>
            )}

            {isStaff ? (
              <div className="text-center py-4 bg-primary/10 rounded-xl border border-primary/20">
                <p className="font-bold text-primary mb-1">Staff View Mode</p>
                <p className="text-xs text-muted-foreground">You are viewing administrative details.</p>
              </div>
            ) : isPlaced ? (
              <div className="text-center py-4">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600 mb-2" />
                <p className="font-medium text-foreground">You are placed</p>
                <p className="text-sm text-muted-foreground">You cannot apply anymore</p>
              </div>
            ) : hasApplied ? (
              <Button disabled className="w-full bg-muted text-muted-foreground cursor-not-allowed" size="lg">
                Applied
              </Button>
            ) : isDeadlinePassed ? (
              <Button className="w-full" size="lg" variant="secondary" disabled>
                Deadline Passed
              </Button>
            ) : (
              <>
                {opportunity.type === "project" ? (
                  <ApplyProjectTeam projectId={opportunity.id} teacherId={opportunity.postedBy || ""} />
                ) : (
                  <Button onClick={handleApply} disabled={isApplying} className="w-full" size="lg">
                    {isApplying ? "Submitting..." : "Apply Now"}
                  </Button>
                )}
              </>
            )}
          </Card>

          <Card className="glass rounded-2xl p-6">
            <h3 className="mb-4 font-semibold text-foreground">Opportunity Details</h3>
            <div className="space-y-3 text-sm">
              {opportunity.stipend && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stipend</span>
                  <span className="font-medium text-foreground">{opportunity.stipend}</span>
                </div>
              )}
              {opportunity.duration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{opportunity.duration}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posted</span>
                <span className="font-medium text-foreground">{formatDate(opportunity.postedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deadline</span>
                <span className={`font-medium ${daysLeft <= 3 ? "text-red-600" : "text-foreground"}`}>
                  {formatDate(opportunity.deadline)}
                  {daysLeft > 0 && ` (${daysLeft}d left)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applicants</span>
                <span className="font-medium text-foreground">{opportunity.applicants || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}