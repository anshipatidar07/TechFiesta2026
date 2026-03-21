// // "use client"
// // import { use, useEffect, useState } from "react"
// // import { useRouter } from "next/navigation"
// // import { useAppStore } from "@/lib/store"
// // import { Card } from "@/components/ui/card"
// // import { Button } from "@/components/ui/button"
// // import { SkillBadge } from "@/components/ui/skill-badge"
// // import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, UsersIcon, EnvelopeIcon } from "@heroicons/react/24/outline"
// // import { formatDate, getDaysUntil } from "@/lib/utils"
// // import { calculateMatchScore } from "@/lib/mock-data"
// // import ApplyProjectTeam from "@/components/apply-project"
// // import { useUser } from "@/contexts/UserContext"

// // export default function OpportunityDetailPage({
// //   params,
// // }: {
// //   params: Promise<{ id: string }>
// // }) {
// //   const resolvedParams = use(params)
// //   const router = useRouter()

// //   // 1. App Store: Contains the student's mock skills for the match score
// //   const { opportunities, currentUser, addNotification } = useAppStore()

// //   // 2. Auth Context: Contains the real logged-in user details (username, id)
// //   const { user, loading: userLoading } = useUser()

// //   const [opportunity, setOpportunity] = useState<any>(null)
// //   const [loading, setLoading] = useState(true)
// //   const [isApplying, setIsApplying] = useState(false)
// //   const [error, setError] = useState<string | null>(null)

// //   // Roles Check
// //   const isStaff = ["tnp", "recruiter", "teacher"].includes(user?.username?.toLowerCase() || "")
// //   const isStudent = user?.username === "student"

// //   useEffect(() => {
// //     const fetchOpportunityById = async () => {
// //       setLoading(true)
// //       setError(null)
// //       try {
// //         const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/internships/${resolvedParams.id}`)

// //         if (res.ok) {
// //           const data = await res.json()

// //           const mappedOpportunity = {
// //             id: data.id,
// //             title: data.title,
// //             company: data.company || data.postedBy?.company_name || "Unknown",
// //             type: "internship",
// //             description: data.description,
// //             skills: Array.isArray(data.skills)
// //               ? data.skills
// //               : (typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()) : []),
// //             postedDate: data.posted_date || new Date().toISOString(),
// //             deadline: data.deadline || new Date().toISOString(),
// //             stipend: data.stipend || "Unpaid",
// //             duration: data.duration || "N/A",
// //             applicants: data.applicants || data.applications?.length || 0,
// //             postedBy: data.postedBy ? `${data.postedBy.first_name} ${data.postedBy.last_name}` : "Unknown",
// //             tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === 'string' ? data.tags.split(',').map((s: string) => s.trim()) : []),
// //             eligibility: {
// //               minCGPA: data.min_cgpa,
// //               departments: Array.isArray(data.departments) ? data.departments : [],
// //               years: Array.isArray(data.years) ? data.years : []
// //             },
// //             // Include applications array from backend
// //             applications: data.applications || []
// //           }
// //           setOpportunity(mappedOpportunity)
// //           return
// //         }

// //         // FALLBACK: If API throws 404, check local store for Projects
// //         const storeOpp = opportunities.find((o) => o.id === resolvedParams.id)
// //         if (storeOpp) {
// //           setOpportunity(storeOpp)
// //         } else {
// //           setError("Opportunity not found")
// //         }

// //       } catch (err: any) {
// //         const storeOpp = opportunities.find((o) => o.id === resolvedParams.id)
// //         if (storeOpp) {
// //           setOpportunity(storeOpp)
// //         } else {
// //           setError(err.message || "Failed to load opportunity")
// //         }
// //       } finally {
// //         setLoading(false)
// //       }
// //     }

// //     if (!userLoading) {
// //       fetchOpportunityById()
// //     }
// //   }, [resolvedParams.id, opportunities, userLoading])


// //   if (loading || userLoading) {
// //     return (
// //       <div className="flex h-[60vh] items-center justify-center">
// //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
// //       </div>
// //     )
// //   }

// //   if (error || !opportunity) {
// //     return (
// //       <div className="text-center py-12">
// //         <p className="text-muted-foreground">{error || "Opportunity not found"}</p>
// //         <Button onClick={() => router.back()} className="mt-4">
// //           Go Back
// //         </Button>
// //       </div>
// //     )
// //   }

// //   // Check if real database user has applied
// //   const hasApplied = opportunity.applications?.some(
// //     (app: any) => app.student?.user_id === user?.id
// //   )
// //   const isPlaced =
// //     opportunity?.applications?.some(
// //       (app: any) =>
// //         app?.student?.user_id === user?.id &&
// //         app?.status === "SELECTED"
// //     ) || false;

// //   // Match score specifically uses the mock 'currentUser' from useAppStore
// //   const matchScore = currentUser && Array.isArray(opportunity.skills)
// //     ? calculateMatchScore(currentUser.skills || [], opportunity.skills)
// //     : 0

// //   const daysLeft = getDaysUntil(opportunity.deadline)
// //   const isDeadlinePassed = daysLeft <= 0

// //   // ----------------------------------------
// //   // HANDLE APPLY TO DATABASE
// //   // ----------------------------------------
// //   const handleApply = async () => {
// //     if (!user) return
// //     setIsApplying(true)

// //     try {
// //       const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/internships/${opportunity.id}/apply`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ userId: user.id }),
// //       });

// //       const result = await response.json();

// //       if (!response.ok) {
// //         throw new Error(result.message || "Failed to apply");
// //       }

// //       // Optimistically update the UI to show applied status
// //       setOpportunity((prev: any) => ({
// //         ...prev,
// //         applicants: prev.applicants + 1,
// //         applications: [
// //           ...(prev.applications || []),
// //           {
// //             id: `temp-${Date.now()}`,
// //             status: "APPLIED",
// //             student: { user_id: user.id }
// //           }
// //         ]
// //       }))

// //       addNotification({
// //         id: `N${Date.now()}`,
// //         title: "Application Submitted",
// //         message: `Your application for ${opportunity.title} has been submitted successfully!`,
// //         type: "success",
// //         read: false,
// //         timestamp: new Date().toISOString(),
// //       })

// //     } catch (err: any) {
// //       alert(err.message);
// //     } finally {
// //       setIsApplying(false)
// //     }
// //   }
// //   const handleSelect = async (applicationId: string) => {
// //     try {
// //       await fetch(
// //         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/internships/applications/${applicationId}/select`,
// //         {
// //           method: "PUT",
// //         }
// //       );

// //       setOpportunity((prev: any) => ({
// //         ...prev,
// //         applications: prev.applications.map((app: any) =>
// //           app.id === applicationId
// //             ? { ...app, status: "SELECTED" }
// //             : app
// //         ),
// //       }));

// //     } catch {
// //       alert("Failed to select student");
// //     }
// //   };
// //   return (
// //     <div className="space-y-6">
// //       <Button onClick={() => router.back()} variant="ghost" size="sm">
// //         <ArrowLeftIcon className="mr-2 h-4 w-4" />
// //         Back
// //       </Button>

// //       <div className="grid gap-6 lg:grid-cols-3">
// //         {/* Main Content */}
// //         <div className="lg:col-span-2 space-y-6">
// //           <Card className="glass rounded-2xl p-6">
// //             <div className="mb-4">
// //               <div className="mb-2 flex items-start justify-between">
// //                 <div className="flex-1">
// //                   <h1 className="text-3xl font-bold text-foreground">
// //                     {opportunity.title}
// //                   </h1>
// //                   <p className="mt-1 text-lg text-muted-foreground">
// //                     {opportunity.company}
// //                   </p>
// //                 </div>

// //                 <span
// //                   className={`rounded-full px-3 py-1 text-sm font-medium ${opportunity.type === "internship"
// //                     ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
// //                     : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
// //                     }`}
// //                 >
// //                   {opportunity.type}
// //                 </span>
// //               </div>

// //               {opportunity.tags && opportunity.tags.length > 0 && (
// //                 <div className="flex flex-wrap gap-2 mb-4">
// //                   {opportunity.tags.map((tag: string) => (
// //                     <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
// //                       {tag}
// //                     </span>
// //                   ))}
// //                 </div>
// //               )}
// //             </div>

// //             <div className="space-y-4">
// //               <div>
// //                 <h2 className="mb-2 font-semibold text-foreground">Description</h2>
// //                 <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
// //                   {opportunity.description}
// //                 </p>
// //               </div>

// //               <div>
// //                 <h2 className="mb-2 font-semibold text-foreground">Required Skills</h2>
// //                 <div className="flex flex-wrap gap-2">
// //                   {Array.isArray(opportunity.skills) && opportunity.skills.map((skill: string) => {
// //                     const isMatched = currentUser?.skills?.some(
// //                       (s: string) => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()),
// //                     )
// //                     return <SkillBadge key={skill} skill={skill} variant={isMatched ? "matched" : "default"} />
// //                   })}
// //                 </div>
// //               </div>

// //               {opportunity.eligibility && (opportunity.eligibility.minCGPA || opportunity.eligibility.departments?.length > 0) && (
// //                 <div>
// //                   <h2 className="mb-2 font-semibold text-foreground">Eligibility</h2>
// //                   <ul className="list-disc list-inside space-y-1 text-muted-foreground">
// //                     {opportunity.eligibility.minCGPA && <li>Minimum CGPA: {opportunity.eligibility.minCGPA}</li>}
// //                     {opportunity.eligibility.departments?.length > 0 && <li>Departments: {opportunity.eligibility.departments.join(", ")}</li>}
// //                   </ul>
// //                 </div>
// //               )}
// //             </div>
// //           </Card>

// //           {/* TNP VIEW: SEE APPLICANTS TABLE */}
// //           {isStaff && (
// //             <Card className="glass rounded-2xl p-6 border-primary/20 bg-primary/5">
// //               <div className="flex items-center gap-2 mb-4">
// //                 <UsersIcon className="h-6 w-6 text-primary" />
// //                 <h2 className="text-xl font-bold text-primary">
// //                   Students Applied ({opportunity.applications?.length || 0})
// //                 </h2>
// //               </div>

// //               {opportunity.applications && opportunity.applications.length > 0 ? (
// //                 <div className="overflow-x-auto rounded-lg border border-border bg-background/50">
// //                   <table className="w-full text-sm text-left">
// //                     <thead className="bg-secondary/50 text-secondary-foreground border-b border-border">
// //                       <tr>
// //                         <th className="px-4 py-3 font-medium">Student Name</th>
// //                         <th className="px-4 py-3 font-medium">Email</th>
// //                         <th className="px-4 py-3 font-medium">Dept</th>
// //                         <th className="px-4 py-3 font-medium">CGPA</th>
// //                         <th className="px-4 py-3 font-medium">Action</th>
// //                       </tr>
// //                     </thead>
// //                     <tbody className="divide-y divide-border">
// //                       {opportunity.applications.map((app: any) => (
// //                         <tr key={app.id || Math.random()} className="hover:bg-muted/50 transition-colors">
// //                           <td className="px-4 py-4 font-medium text-foreground whitespace-nowrap">
// //                             {app.student?.first_name} {app.student?.last_name}
// //                           </td>
// //                           <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
// //                             <div className="flex items-center gap-1.5">
// //                               <EnvelopeIcon className="h-4 w-4" />
// //                               <a href={`mailto:${app.student?.primary_email}`} className="hover:text-primary transition-colors">
// //                                 {app.student?.primary_email}
// //                               </a>
// //                             </div>
// //                           </td>
// //                           <td className="px-4 py-4 text-muted-foreground">
// //                             {app.student?.department || "N/A"}
// //                           </td>
// //                           <td className="px-4 py-4 font-bold text-foreground">
// //                             {app.student?.cgpa || "N/A"}
// //                           </td>
// //                           <td className="px-4 py-4">
// //                             {app.status === "SELECTED" ? (
// //                               <span className="text-green-600 font-semibold">
// //                                 Selected
// //                               </span>
// //                             ) : (
// //                               <Button
// //                                 size="sm"
// //                                 onClick={() => handleSelect(app.id)}
// //                               >
// //                                 Select
// //                               </Button>
// //                             )}
// //                           </td>
// //                         </tr>
// //                       ))}
// //                     </tbody>
// //                   </table>
// //                 </div>
// //               ) : (
// //                 <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-background/50">
// //                   <p className="text-muted-foreground">No students have applied for this opportunity yet.</p>
// //                 </div>
// //               )}
// //             </Card>
// //           )}

// //           {/* Application Timeline for Students */}
// //           {isStudent && hasApplied && (
// //             <Card className="glass rounded-2xl p-6">
// //               <h2 className="mb-6 text-xl font-semibold text-foreground">Application Timeline</h2>
// //               <div className="relative">
// //                 <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />
// //                 <div className="space-y-6">
// //                   <div className="relative flex items-start gap-4 pl-10">
// //                     <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary">
// //                       <CheckCircleIcon className="h-5 w-5 text-primary-foreground" />
// //                     </div>
// //                     <div className="flex-1 pb-4">
// //                       <h3 className="font-semibold text-foreground">Applied Successfully</h3>
// //                       <p className="text-sm text-muted-foreground">Your profile has been sent to the recruiter.</p>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </Card>
// //           )}
// //         </div>

// //         {/* Sidebar */}
// //         <div className="space-y-6">
// //           <Card className="glass rounded-2xl p-6">

// //             {/* ONLY STUDENT SEES THE MATCH SCORE */}
// //             {isStudent && currentUser && (
// //               <div className="mb-4 text-center">
// //                 <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
// //                   <span className="text-2xl font-bold text-primary">{matchScore}%</span>
// //                 </div>
// //                 <p className="text-sm text-muted-foreground">Your Match Score</p>
// //               </div>
// //             )}

// //             {/* BUTTONS / ALERTS BASED ON ROLE */}
// //             {isStaff ? (
// //               <div className="text-center py-4 bg-primary/10 rounded-xl border border-primary/20">
// //                 <p className="font-bold text-primary mb-1">Staff View Mode</p>
// //                 <p className="text-xs text-muted-foreground">You are viewing administrative details.</p>
// //               </div>
// //             ) : isPlaced ? (
// //               <div className="text-center py-4">
// //                 <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600 mb-2" />
// //                 <p className="font-medium text-foreground">
// //                   You are placed
// //                 </p>
// //                 <p className="text-sm text-muted-foreground">
// //                   You cannot apply anymore
// //                 </p>
// //               </div>
// //             ) : hasApplied ? (
// //               <Button
// //                 disabled
// //                 className="w-full bg-muted text-muted-foreground cursor-not-allowed"
// //                 size="lg"
// //               >
// //                 Applied
// //               </Button>
// //             ) : isDeadlinePassed ? (
// //               <Button className="w-full" size="lg" variant="secondary" disabled>
// //                 Deadline Passed
// //               </Button>
// //             ) : (
// //               <>
// //                 {opportunity.type === "project" ? (
// //                   <ApplyProjectTeam projectId={opportunity.id} teacherId={opportunity.postedBy || ""} />
// //                 ) : (
// //                   <Button
// //                     onClick={handleApply}
// //                     disabled={isApplying || daysLeft <= 0}
// //                     className="w-full"
// //                     size="lg"
// //                   >
// //                     {isApplying ? "Submitting..." : "Apply Now"}
// //                   </Button>
// //                 )}
// //               </>
// //             )}
// //           </Card>

// //           <Card className="glass rounded-2xl p-6">
// //             <h3 className="mb-4 font-semibold text-foreground">Opportunity Details</h3>
// //             <div className="space-y-3 text-sm">
// //               {opportunity.stipend && (
// //                 <div className="flex justify-between">
// //                   <span className="text-muted-foreground">Stipend</span>
// //                   <span className="font-medium text-foreground">{opportunity.stipend}</span>
// //                 </div>
// //               )}
// //               {opportunity.duration && (
// //                 <div className="flex justify-between">
// //                   <span className="text-muted-foreground">Duration</span>
// //                   <span className="font-medium text-foreground">{opportunity.duration}</span>
// //                 </div>
// //               )}
// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Posted</span>
// //                 <span className="font-medium text-foreground">{formatDate(opportunity.postedDate)}</span>
// //               </div>
// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Deadline</span>
// //                 <span className={`font-medium ${daysLeft <= 3 ? "text-red-600" : "text-foreground"}`}>
// //                   {formatDate(opportunity.deadline)}
// //                   {daysLeft > 0 && ` (${daysLeft}d left)`}
// //                 </span>
// //               </div>
// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Applicants</span>
// //                 <span className="font-medium text-foreground">{opportunity.applicants || 0}</span>
// //               </div>
// //             </div>
// //           </Card>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }
// "use client"
// import { use, useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { useAppStore } from "@/lib/store"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { SkillBadge } from "@/components/ui/skill-badge"
// import { 
//   ArrowLeftIcon, 
//   CheckCircleIcon, 
//   ClockIcon, 
//   UsersIcon, 
//   EnvelopeIcon 
// } from "@heroicons/react/24/outline"
// import { formatDate, getDaysUntil } from "@/lib/utils"
// import { calculateMatchScore } from "@/lib/mock-data"
// import ApplyProjectTeam from "@/components/apply-project"
// import { useUser } from "@/contexts/UserContext"
// import { Badge } from "@/components/ui/badge"

// export default function OpportunityDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>
// }) {
//   const resolvedParams = use(params)
//   const router = useRouter()

//   // Context & Store
//   const { currentUser, addNotification, opportunities } = useAppStore()
//   const { user, loading: userLoading } = useUser()

//   const [opportunity, setOpportunity] = useState<any>(null)
//   const [loading, setLoading] = useState(true)
//   const [isApplying, setIsApplying] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   // Roles Check
//   const isStaff = ["tnp", "recruiter", "teacher"].includes(user?.username?.toLowerCase() || "")
//   const isStudent = user?.role === "STUDENT" || user?.username === "student"

//   useEffect(() => {
//     const fetchOpportunityById = async () => {
//       setLoading(true)
//       setError(null)
//       try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/internships/${resolvedParams.id}`)

//         if (res.ok) {
//           const data = await res.json()
//           const mappedOpportunity = {
//             ...data,
//             company: data.company || data.postedBy?.company_name || "Unknown",
//             type: "internship",
//             postedDate: data.posted_date,
//             applicants: data.applicants || data.applications?.length || 0,
//             applications: data.applications || []
//           }
//           setOpportunity(mappedOpportunity)
//         } else {
//           // Fallback to mock data if API fails
//           const storeOpp = opportunities.find((o) => o.id === resolvedParams.id)
//           if (storeOpp) setOpportunity(storeOpp)
//           else setError("Opportunity not found")
//         }
//       } catch (err: any) {
//         setError(err.message || "Failed to load opportunity")
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (!userLoading) fetchOpportunityById()
//   }, [resolvedParams.id, userLoading, opportunities])

//   if (loading || userLoading) {
//     return (
//       <div className="flex h-[60vh] items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//       </div>
//     )
//   }

//   if (error || !opportunity) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-muted-foreground">{error || "Opportunity not found"}</p>
//         <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
//       </div>
//     )
//   }

//   // --- LOGIC CHECK (Backend Synchronized) ---
//   // We check the 'applications' array returned by the backend for this user's ID
//   const userApplication = opportunity.applications?.find(
//     (app: any) => app.student?.user_id === user?.id
//   )
//   const hasApplied = !!userApplication
//   const isPlaced = userApplication?.status === "SELECTED"

//   const matchScore = currentUser && Array.isArray(opportunity.skills)
//     ? calculateMatchScore(currentUser.skills || [], opportunity.skills)
//     : 0

//   const daysLeft = getDaysUntil(opportunity.deadline)
//   const isDeadlinePassed = daysLeft <= 0

//   const handleApply = async () => {
//     if (!user) return
//     setIsApplying(true)

//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/internships/${opportunity.id}/apply`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: user.id }),
//       });

//       const result = await response.json();
//       if (!response.ok) throw new Error(result.message || "Failed to apply");

//       // Optimistic Update: Add application to local state so UI updates instantly
//       setOpportunity((prev: any) => ({
//         ...prev,
//         applicants: (prev.applicants || 0) + 1,
//         applications: [...(prev.applications || []), { student: { user_id: user.id }, status: "APPLIED" }]
//       }))

//       addNotification({
//         id: `N${Date.now()}`,
//         title: "Application Submitted",
//         message: `Applied successfully for ${opportunity.title}!`,
//         type: "success",
//         read: false,
//         timestamp: new Date().toISOString(),
//       })
//     } catch (err: any) {
//       alert(err.message);
//     } finally {
//       setIsApplying(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <Button onClick={() => router.back()} variant="ghost" size="sm">
//         <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
//       </Button>

//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* Main Content */}
//         <div className="lg:col-span-2 space-y-6">
//           <Card className="glass rounded-2xl p-6">
//             <div className="mb-4">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <h1 className="text-3xl font-bold">{opportunity.title}</h1>
//                   <p className="text-lg text-muted-foreground">{opportunity.company}</p>
//                 </div>
//                 <Badge variant="outline" className="capitalize">{opportunity.type}</Badge>
//               </div>
//             </div>

//             <div className="space-y-6">
//               <section>
//                 <h2 className="mb-2 font-semibold">Description</h2>
//                 <p className="text-muted-foreground whitespace-pre-wrap">{opportunity.description}</p>
//               </section>

//               <section>
//                 <h2 className="mb-2 font-semibold">Required Skills</h2>
//                 <div className="flex flex-wrap gap-2">
//                   {opportunity.skills?.map((skill: string) => (
//                     <SkillBadge key={skill} skill={skill} />
//                   ))}
//                 </div>
//               </section>
//             </div>
//           </Card>

//           {/* TNP Applicants Table */}
//           {isStaff && (
//             <Card className="glass rounded-2xl p-6 border-primary/20 bg-primary/5">
//               <div className="flex items-center gap-2 mb-4">
//                 <UsersIcon className="h-6 w-6 text-primary" />
//                 <h2 className="text-xl font-bold">Applicants ({opportunity.applications?.length || 0})</h2>
//               </div>
//               {/* Table logic omitted for brevity, same as your original */}
//             </Card>
//           )}
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           <Card className="glass rounded-2xl p-6">
//             {isStudent && (
//               <div className="mb-6 text-center">
//                 <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
//                   <span className="text-2xl font-bold text-primary">{matchScore}%</span>
//                 </div>
//                 <p className="text-sm text-muted-foreground">Skill Match</p>
//               </div>
//             )}

//             {/* STATUS-BASED UI ACTION */}
//             <div className="space-y-4">
//               {isStaff ? (
//                 <div className="text-center py-3 bg-secondary rounded-xl text-sm font-medium">
//                   Staff View Mode
//                 </div>
//               ) : isPlaced ? (
//                 <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200">
//                   <CheckCircleIcon className="mx-auto h-10 w-10 text-green-600 mb-2" />
//                   <p className="font-bold text-green-700">Application Selected!</p>
//                   <p className="text-xs text-green-600">You are placed here.</p>
//                 </div>
//               ) : hasApplied ? (
//                 <div className="space-y-3">
//                   <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200">
//                     <ClockIcon className="mx-auto h-10 w-10 text-blue-600 mb-2" />
//                     <p className="font-bold text-blue-700 text-sm">Application Submitted</p>
//                     <p className="text-xs text-blue-600">Awaiting recruiter review</p>
//                   </div>
//                   <Button disabled className="w-full opacity-50 cursor-not-allowed">
//                     Applied
//                   </Button>
//                 </div>
//               ) : isDeadlinePassed ? (
//                 <Button className="w-full" variant="secondary" disabled>Deadline Passed</Button>
//               ) : (
//                 <Button 
//                   onClick={handleApply} 
//                   disabled={isApplying} 
//                   className="w-full" 
//                   size="lg"
//                 >
//                   {isApplying ? "Submitting..." : "Apply Now"}
//                 </Button>
//               )}
//             </div>
//           </Card>

//           {/* Quick Info Card */}
//           <Card className="glass rounded-2xl p-6 space-y-3 text-sm">
//             <h3 className="font-semibold">Quick Info</h3>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Stipend</span>
//               <span className="font-medium">{opportunity.stipend}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Duration</span>
//               <span className="font-medium">{opportunity.duration}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Deadline</span>
//               <span className={daysLeft <= 3 ? "text-red-500 font-bold" : ""}>
//                 {formatDate(opportunity.deadline)}
//               </span>
//             </div>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }
"use client"
import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkillBadge } from "@/components/ui/skill-badge"
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, UsersIcon, EnvelopeIcon } from "@heroicons/react/24/outline"
import { formatDate, getDaysUntil } from "@/lib/utils"
import { calculateMatchScore } from "@/lib/mock-data"
import ApplyProjectTeam from "@/components/apply-project"
import { useUser } from "@/contexts/UserContext"

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "")

  // 1. App Store: Contains the student's mock skills for the match score
  const { opportunities, currentUser, addNotification } = useAppStore()

  // 2. Auth Context: Contains the real logged-in user details (username, id)
  const { user, loading: userLoading } = useUser()

  const [opportunity, setOpportunity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Roles Check
  const isStaff = ["tnp", "recruiter", "teacher"].includes(user?.username?.toLowerCase() || "")
  console.log("User IDDDDD",user?.username);
  const isStudent = user?.username === "student" || user?.username === "anshi_student"
  console.log("Is Student",isStudent);
  useEffect(() => {
    const fetchOpportunityById = async () => {
      setLoading(true)
      setError(null)
      try {
        const internshipUrl = `${backendBase}/api/internships/${resolvedParams.id}`
        const res = await fetch(internshipUrl)

        if (res.ok) {
          const data = await res.json()

          const mappedOpportunity = {
            id: data.id,
            title: data.title,
            company: data.company || data.postedBy?.company_name || "Unknown",
            type: "internship",
            description: data.description,
            skills: Array.isArray(data.skills)
              ? data.skills
              : (typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()) : []),
            postedDate: data.posted_date || new Date().toISOString(),
            deadline: data.deadline || new Date().toISOString(),
            stipend: data.stipend || "Unpaid",
            duration: data.duration || "N/A",
            applicants: data.applicants || data.applications?.length || 0,
            postedBy: data.postedBy ? `${data.postedBy.first_name} ${data.postedBy.last_name}` : "Unknown",
            tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === 'string' ? data.tags.split(',').map((s: string) => s.trim()) : []),
            eligibility: {
              minCGPA: data.min_cgpa,
              departments: Array.isArray(data.departments) ? data.departments : [],
              years: Array.isArray(data.years) ? data.years : []
            },
            // Include applications array from backend
            applications: data.applications || []
          }
          setOpportunity(mappedOpportunity)
          return
        }

        // FALLBACK 1: Try projects endpoint (academic projects have numeric ids)
        const projectsRes = await fetch(`${backendBase}/api/academic-project/getAllAcademicProjects`)
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          const project = projectsData?.data?.find((p: any) => p.project_id?.toString() === resolvedParams.id)
          if (project) {
            const mappedProject = {
              id: project.project_id.toString(),
              title: project.title,
              company: "Academic Project",
              type: "project",
              description: project.description,
              skills: project.technology_stack ? project.technology_stack.split(',').map((s: string) => s.trim()) : [],
              postedDate: project.created_at || new Date().toISOString(),
              deadline: project.deadline || new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
              stipend: "Academic Credit",
              duration: project.academic_year || "N/A",
              applicants: project._count?.groups || 0,
              postedBy: project.supervisor ? `${project.supervisor.first_name} ${project.supervisor.last_name}` : "Unknown",
              tags: [],
              eligibility: {},
              applications: [],
            }
            setOpportunity(mappedProject)
            return
          }
        }

        // FALLBACK 2: Check local store
        const storeOpp = opportunities.find((o) => o.id === resolvedParams.id)
        if (storeOpp) setOpportunity(storeOpp)
        else setError("Opportunity not found")

      } catch (err: any) {
        const storeOpp = opportunities.find((o) => o.id === resolvedParams.id)
        if (storeOpp) {
          setOpportunity(storeOpp)
        } else {
          setError(err.message || "Failed to load opportunity")
        }
      } finally {
        setLoading(false)
      }
    }

    if (!userLoading) {
      fetchOpportunityById()
    }
  }, [resolvedParams.id, opportunities, userLoading, backendBase])


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
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  // Check if real database user has applied
  const hasApplied = opportunity.applications?.some(
    (app: any) => app.student?.user_id === user?.id
  )
  const isPlaced =
    opportunity?.applications?.some(
      (app: any) =>
        app?.student?.user_id === user?.id &&
        app?.status === "SELECTED"
    ) || false;

  // Match score specifically uses the mock 'currentUser' from useAppStore
  const matchScore = currentUser && Array.isArray(opportunity.skills)
    ? calculateMatchScore(currentUser.skills || [], opportunity.skills)
    : 0

  const daysLeft = getDaysUntil(opportunity.deadline)
  const isDeadlinePassed = daysLeft <= 0

  // ----------------------------------------
  // HANDLE APPLY TO DATABASE
  // ----------------------------------------
  const handleApply = async () => {
    if (!user) return
    setIsApplying(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/internships/${opportunity.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to apply");
      }

      // Optimistically update the UI to show applied status
      setOpportunity((prev: any) => ({
        ...prev,
        applicants: prev.applicants + 1,
        applications: [
          ...(prev.applications || []),
          {
            id: `temp-${Date.now()}`,
            status: "APPLIED",
            student: { user_id: user.id }
          }
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
      alert(err.message);
    } finally {
      setIsApplying(false)
    }
  }
  const handleSelect = async (applicationId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/internships/applications/${applicationId}/select`,
        {
          method: "PUT",
        }
      );

      setOpportunity((prev: any) => ({
        ...prev,
        applications: prev.applications.map((app: any) =>
          app.id === applicationId
            ? { ...app, status: "SELECTED" }
            : app
        ),
      }));

    } catch {
      alert("Failed to select student");
    }
  };
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
                  <h1 className="text-3xl font-bold text-foreground">
                    {opportunity.title}
                  </h1>
                  <p className="mt-1 text-lg text-muted-foreground">
                    {opportunity.company}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${opportunity.type === "internship"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    }`}
                >
                  {opportunity.type}
                </span>
              </div>

              {opportunity.tags && opportunity.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {opportunity.tags.map((tag: string) => (
                    <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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
                      (s: string) => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()),
                    )
                    return <SkillBadge key={skill} skill={skill} variant={isMatched ? "matched" : "default"} />
                  })}
                </div>
              </div>

              {opportunity.eligibility && (opportunity.eligibility.minCGPA || opportunity.eligibility.departments?.length > 0) && (
                <div>
                  <h2 className="mb-2 font-semibold text-foreground">Eligibility</h2>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {opportunity.eligibility.minCGPA && <li>Minimum CGPA: {opportunity.eligibility.minCGPA}</li>}
                    {opportunity.eligibility.departments?.length > 0 && <li>Departments: {opportunity.eligibility.departments.join(", ")}</li>}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* TNP VIEW: SEE APPLICANTS TABLE */}
          {isStaff && (
            <Card className="glass rounded-2xl p-6 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <UsersIcon className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-primary">
                  Students Applied ({opportunity.applications?.length || 0})
                </h2>
              </div>

              {opportunity.applications && opportunity.applications.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-border bg-background/50">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-secondary-foreground border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-medium">Student Name</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Dept</th>
                        <th className="px-4 py-3 font-medium">CGPA</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {opportunity.applications.map((app: any) => (
                        <tr key={app.id || Math.random()} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-4 font-medium text-foreground whitespace-nowrap">
                            {app.student?.first_name} {app.student?.last_name}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <EnvelopeIcon className="h-4 w-4" />
                              <a href={`mailto:${app.student?.primary_email}`} className="hover:text-primary transition-colors">
                                {app.student?.primary_email}
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {app.student?.department || "N/A"}
                          </td>
                          <td className="px-4 py-4 font-bold text-foreground">
                            {app.student?.cgpa || "N/A"}
                          </td>
                          <td className="px-4 py-4">
                            {app.status === "SELECTED" ? (
                              <span className="text-green-600 font-semibold">
                                Selected
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleSelect(app.id)}
                              >
                                Select
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-background/50">
                  <p className="text-muted-foreground">No students have applied for this opportunity yet.</p>
                </div>
              )}
            </Card>
          )}

          {/* Application Timeline for Students */}
          {isStudent && hasApplied && (
            <Card className="glass rounded-2xl p-6">
              <h2 className="mb-6 text-xl font-semibold text-foreground">Application Timeline</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />
                <div className="space-y-6">
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
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="glass rounded-2xl p-6">

            {/* ONLY STUDENT SEES THE MATCH SCORE */}
            {isStudent && currentUser && (
              <div className="mb-4 text-center">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">{matchScore}%</span>
                </div>
                <p className="text-sm text-muted-foreground">Your Match Score</p>
              </div>
            )}

            {/* BUTTONS / ALERTS BASED ON ROLE */}
            {isStaff ? (
              <div className="text-center py-4 bg-primary/10 rounded-xl border border-primary/20">
                <p className="font-bold text-primary mb-1">Staff View Mode</p>
                <p className="text-xs text-muted-foreground">You are viewing administrative details.</p>
              </div>
            ) : isPlaced ? (
              <div className="text-center py-4">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600 mb-2" />
                <p className="font-medium text-foreground">
                  You are placed
                </p>
                <p className="text-sm text-muted-foreground">
                  You cannot apply anymore
                </p>
              </div>
            ) : hasApplied ? (
              <Button
                disabled
                className="w-full bg-muted text-muted-foreground cursor-not-allowed"
                size="lg"
              >
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
                  <Button
                    onClick={handleApply}
                    disabled={isApplying || daysLeft <= 0}
                    className="w-full"
                    size="lg"
                  >
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