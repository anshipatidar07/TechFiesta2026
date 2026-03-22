"use client"

import { useAppStore } from "@/lib/store"
import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkillBadge } from "@/components/ui/skill-badge"
import Link from "next/link"
import { BriefcaseIcon, UserGroupIcon, AcademicCapIcon } from "@heroicons/react/24/outline"
import { calculateMatchScore } from "@/lib/mock-data"
import { useEffect, useState } from "react"
import { useUser } from "@/contexts/UserContext"

export default function TeacherDashboard() {
  const { opportunities, students } = useAppStore()
  const { user: currentUser } = useUser() 
  const [loading, setLoading] = useState(false)
  const [projectOpportunities, setProjectOpportunities] = useState<any[]>([])
  const myOpportunities = [
    ...opportunities.filter((o) => o.postedBy?.includes("Prof") || o.postedBy?.includes("Dr")),
    ...projectOpportunities
  ]

  // Mock: Latest posted opportunity for matching
  const latestOpportunity = myOpportunities[0] || opportunities[1]

  // Sort students by match score for latest opportunity
  const rankedStudents = students
    .map((student) => ({
      ...student,
      matchScore: latestOpportunity ? calculateMatchScore(student.skills, latestOpportunity.skills) : 0,
    }))
    .sort((a, b) => b.matchScore - a.matchScore)


  useEffect(() => {
      const fetchTeacherProjects = async () => {
        setLoading(true)
        try {
          console.log("fetching projects");
          const response = await fetch(`http://localhost:5000/api/academic-project/getAcademicProjectByTeacherId/${currentUser?.id}`)
          const result = await response.json()
          
          if (result.success) {
            // Map backend 'Project' schema to match your frontend 'Opportunity' interface
            const mappedData = result.data.map((proj: any) => ({
              id: proj.project_id.toString(),
              title: proj.title,
              company: "Academic Project", // Projects are internal
              type: "project",
              description: proj.description,
              skills: proj.technology_stack.split(',').map((s: string) => s.trim()),
              postedDate: new Date().toISOString(), // Default for UI sorting
              deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(), // Placeholder deadline
              stipend: "Academic Credit",
              duration: proj.academic_year,
              applicants: proj._count?.groups || 0
            }))
            setProjectOpportunities(mappedData)
            const existingOpps = useAppStore.getState().opportunities;
            const merged = [...existingOpps, ...mappedData];
            const uniqueOpps = Array.from(new Map(merged.map(item => [item.id, item])).values());
            useAppStore.setState({ opportunities: uniqueOpps });
          }
        } catch (error) {
          console.error("Error fetching projects:", error)
        } finally {
          setLoading(false)
        }
      }
  
      if (currentUser?.id) {
        fetchTeacherProjects()
      }
    }, [currentUser?.id])
  

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage projects and guide students</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="My Opportunities"
          value={myOpportunities.length}
          description="Projects & internships"
          icon={<BriefcaseIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Active Projects"
          value={projectOpportunities.length}
          description="This semester"
          icon={<AcademicCapIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Total Students"
          value={students.length}
          description="In database"
          icon={<UserGroupIcon className="h-6 w-6" />}
        />
      </div>

      <Card className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Button className="justify-start h-auto py-4" asChild>
            <Link href="/post-opportunity">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BriefcaseIcon className="h-5 w-5" />
                  <span className="font-semibold">Post New Opportunity</span>
                </div>
                <p className="text-xs text-primary-foreground/80">Create internship or project</p>
              </div>
            </Link>
          </Button>
          <Button className="justify-start h-auto py-4 bg-transparent" variant="outline" asChild>
            <Link href="/resumes">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <UserGroupIcon className="h-5 w-5" />
                  <span className="font-semibold">Browse Students</span>
                </div>
                <p className="text-xs text-muted-foreground">View student profiles</p>
              </div>
            </Link>
          </Button>
        </div>
      </Card>

      {latestOpportunity && (
        <Card className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Best-Fit Students for: {latestOpportunity.title}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">Students ranked by skill match score</p>

          <div className="space-y-3">
            {rankedStudents.slice(0, 8).map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-all hover:border-primary/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-foreground">Student {student.id}</h3>
                    <span className="text-sm text-muted-foreground">
                      {student.department} • Year {student.year} • CGPA: {student.cgpa}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 5).map((skill) => (
                      <SkillBadge key={skill} skill={skill} variant="default" />
                    ))}
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">{student.matchScore}%</span>
                  </div>
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">My Posted Opportunities</h2>
        {myOpportunities.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {myOpportunities.map((opp) => (
              <div key={opp.id} className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{opp.title}</h3>
                    <p className="text-sm text-muted-foreground">{opp.company}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">{opp.applicants} applicants</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{opp.description}</p>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/opportunities/${opp.id}`}>View Details</Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No opportunities posted yet</p>
            <Button asChild>
              <Link href="/post-opportunity">Post Your First Opportunity</Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
