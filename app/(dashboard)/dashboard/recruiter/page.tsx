"use client"

import { useState, useEffect, useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserGroupIcon, BriefcaseIcon, KeyIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import MiniSearch from "minisearch"

export default function RecruiterDashboard() {
  const { students, opportunities } = useAppStore()
  
  // State for API data
  const [resumes, setResumes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  // New state for search query
  const [searchQuery, setSearchQuery] = useState("")

  // Function to handle resume viewing
  const handleViewResume = async (documentId: string) => {
    try {
      // Fetch the PDF from the download endpoint with anonymized parameter
      const response = await fetch(
        `http://localhost:5000/resume/download/${documentId}?anonymized=true`,
        {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to download resume')
      }
      
      // Create a blob from the response
      const blob = await response.blob()
      
      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob)
      
      // Open in new tab
      window.open(blobUrl, '_blank')
      
      // Clean up the blob URL after a delay (in case the tab takes time to load)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    } catch (error) {
      console.error('Error viewing resume:', error)
      alert('Failed to load resume. Please try again.')
    }
  }

  // Fetch data directly for authenticated recruiter sessions
  useEffect(() => {
    setIsLoading(true)
    fetch("http://localhost:5000/resume/listall")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Sort by newest first
          const sortedDocs = data.documents.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          setResumes(sortedDocs)
        }
      })
      .catch((error) => console.error("Error fetching resumes:", error))
      .finally(() => setIsLoading(false))
  }, [])

  // --- MINISEARCH OPTIMIZATION LOGIC ---

  // 1. Initialize and memoize MiniSearch index
  const miniSearch = useMemo(() => {
    const ms = new MiniSearch({
      fields: ['skillsText', 'name', 'student_registration_number'], // Fields to search
      storeFields: ['id'], // Fields to return in results
      idField: 'id'
    })

    // Prepare data: Join skills array into a single searchable string
    const preparedDocs = resumes.map(doc => ({
      ...doc,
      skillsText: doc.skills ? doc.skills.join(' ') : ''
    }))

    ms.addAll(preparedDocs)
    return ms
  }, [resumes])

  // 2. Execute search when query changes (AND logic first, then OR logic)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    // Search with AND logic (must contain ALL terms)
    const andResults = miniSearch.search(searchQuery, {
      prefix: true, // Allows partial matching (e.g., "spr" matches "springboot")
      combineWith: 'AND',
      boost: { skillsText: 2 } // Prioritize matches found in skills
    })

    // Search with OR logic (must contain AT LEAST ONE term)
    const orResults = miniSearch.search(searchQuery, {
      prefix: true,
      combineWith: 'OR',
      boost: { skillsText: 2 }
    })

    // Combine them: AND results go first, OR results appended without duplicates
    const andIds = new Set(andResults.map(r => r.id))
    const combinedIds = [
      ...andResults.map(r => r.id),
      ...orResults.map(r => r.id).filter(id => !andIds.has(id))
    ]

    // Map the combined IDs back to the full resume objects
    return combinedIds.map(id => resumes.find(r => r.id === id)).filter(Boolean)
  }, [searchQuery, miniSearch, resumes])

  const topSkills = ["React", "Python", "Machine Learning", "Node.js", "Android"]
  const uniqueStudents = new Set(resumes.map(doc => doc.student_registration_number)).size
  
  // Determine what to display
  const displayedResumes = searchQuery.trim() ? searchResults : resumes.slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recruiter Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Discover top talent from our campus</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Active Candidates"
          value={uniqueStudents}
          description="Unique student profiles"
          icon={<UserGroupIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Total Resumes"
          value={resumes.length}
          description="Uploaded to database"
          icon={<DocumentTextIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Active Opportunities"
          value={opportunities?.length || 0}
          description="Posted by companies"
          icon={<BriefcaseIcon className="h-6 w-6" />}
        />
      </div>

      <Card className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Button className="justify-start h-auto py-4" asChild>
            <Link href="/resumes">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <UserGroupIcon className="h-5 w-5" />
                  <span className="font-semibold">Browse Candidates</span>
                </div>
                <p className="text-xs text-primary-foreground/80">View anonymous student profiles</p>
              </div>
            </Link>
          </Button>
          <Button className="justify-start h-auto py-4 bg-transparent" variant="outline" asChild>
            <Link href="/analytics">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BriefcaseIcon className="h-5 w-5" />
                  <span className="font-semibold">View Analytics</span>
                </div>
                <p className="text-xs text-muted-foreground">Skill distribution & insights</p>
              </div>
            </Link>
          </Button>
        </div>
      </Card>

      <Card className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Top Candidate Skills</h2>
        <div className="grid gap-4 md:grid-cols-5">
          {topSkills.map((skill) => {
            const count = resumes.filter((doc) =>
              doc.skills && doc.skills.some((sk) => sk.toLowerCase().includes(skill.toLowerCase())),
            ).length
            return (
              <div key={skill} className="text-center rounded-lg border border-border p-4">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-sm text-muted-foreground">{skill}</div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Candidate Database</h2>
            <p className="text-sm text-muted-foreground">
              {searchQuery.trim() ? "Search Results" : "Latest candidate submissions"}
            </p>
          </div>
        </div>
        
        {/* NEW SEARCH BAR SECTION */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search by skills, name, or ID (e.g. Java Kotlin Springboot)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:max-w-xl border-primary/20 focus-visible:ring-primary"
          />
          {searchQuery.trim() && (
            <p className="mt-2 text-sm text-muted-foreground">
              Showing {searchResults.length} candidates matching your search.
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : displayedResumes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery.trim() ? "No resumes found matching those terms." : "No resumes available."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {displayedResumes.map((doc) => (
              <div key={doc.id} className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="w-full">
                    <h3 className="font-semibold text-foreground uppercase">
                      ID: {doc.student_registration_number}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1 truncate max-w-full">
                      {doc.name}
                    </p>
    
                    {doc.skills && doc.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {doc.skills.slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-0.5 text-xs font-medium text-secondary-foreground border border-border">
                            {skill}
                          </span>
                        ))}
                        {doc.skills.length > 4 && (
                          <span className="text-xs text-muted-foreground self-center ml-1">
                            +{doc.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full bg-transparent mt-2"
                  onClick={() => handleViewResume(doc.id)}
                >
                  View Resume PDF
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* Read-Only Access Card remains the same... */}
      <Card className="glass rounded-2xl p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Read-Only Access</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Your current access allows you to browse anonymous candidate profiles and view opportunities. To post
              opportunities or schedule interviews, please contact the TnP office.
            </p>
            <Button variant="outline" size="sm">
              Contact TnP Office
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}