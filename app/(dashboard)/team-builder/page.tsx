// "use client"

// import { useEffect, useState, useMemo } from "react"
// import { useAppStore } from "@/lib/store"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { DomainChart } from "@/components/ui/domain-chart"
// import { SkillBadge } from "@/components/ui/skill-badge"
// import { 
//   UserGroupIcon, 
//   SparklesIcon, 
//   PlusIcon, 
//   XMarkIcon, 
//   CheckCircleIcon,
//   MagnifyingGlassIcon 
// } from "@heroicons/react/24/outline"
// import { generateTeamRecommendations } from "@/lib/mock-data"
// // Import the new data file
// import { mockStudents2 } from "@/lib/mock-student-data" 
// import { toast } from "sonner"
// import MiniSearch from 'minisearch'

// export default function TeamBuilderPage() {
//   const { currentUser, students, teamRecommendations, setTeamRecommendations } = useAppStore()
  
//   // Local state
//   const [myTeams, setMyTeams] = useState<any[]>([]) 
//   const [isCreating, setIsCreating] = useState(false)
//   const [draftTeamName, setDraftTeamName] = useState("")
//   const [draftMembers, setDraftMembers] = useState<any[]>([])
  
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedTeam, setSelectedTeam] = useState<any>(null)

//   // Combined pool of students (Store data + New Mock data)
//   const allStudents = useMemo(() => {
//     // If you only want the new data, just return mockStudents2
//     // If you want both, use [...students, ...mockStudents2]
//     return [...students, ...mockStudents2];
//   }, [students]);

//   useEffect(() => {
//     if (currentUser && teamRecommendations.length === 0) {
//       const recommendations = generateTeamRecommendations(currentUser, allStudents)
//       setTeamRecommendations(recommendations)
//     }
//   }, [currentUser, allStudents, teamRecommendations, setTeamRecommendations])

//   // --- Search Logic ---
//   const filteredCandidates = useMemo(() => {
//     // 1. If no search, show AI recommendations based on the new full list
//     if (!searchQuery.trim()) {
//       // Return recommendations, but ensure they exist in our current allStudents list
//       return teamRecommendations.filter(rec => allStudents.some(s => s.id === rec.id));
//     }

//     // 2. Configure MiniSearch
//     const miniSearch = new MiniSearch({
//       fields: ['name', 'skills', 'department'], // fields to index for full-text search
//       storeFields: ['id', 'name', 'skills', 'department', 'year', 'domains'], // fields to return
//       searchOptions: {
//         boost: { name: 2, skills: 1.5, department: 1 }, 
//         prefix: true, // "Rea" matches "React"
//         fuzzy: 0.2    // "JavaScrpt" matches "JavaScript"
//       }
//     });

//     // 3. Filter out current user from the pool
//     const searchPool = allStudents.filter(s => s.id !== currentUser?.id);

//     // 4. Index the data
//     // Since IDs are unique now, we don't need the Map deduplication logic.
//     // This allows multiple people with the name "Rahul Verma" to be indexed separately.
//     miniSearch.addAll(searchPool);

//     // 5. Perform Search
//     // "AND" logic: "Neha C++" -> Must have BOTH "Neha" and "C++"
//     let results = miniSearch.search(searchQuery, { combineWith: 'AND' });

//     // Fallback: If "AND" returns nothing, try "OR" (looser match)
//     if (results.length === 0) {
//        results = miniSearch.search(searchQuery, { combineWith: 'OR' });
//     }

//     // 6. Map back to student objects and add match score
//     return results.map((result: any) => {
//       // Try to find if this result was already in our recommendations to preserve the "AI Score"
//       const rec = teamRecommendations.find(r => r.id === result.id);
      
//       return {
//         ...result, 
//         // If it was an AI recommendation, use that score. If not, it's a raw search result (score 0 or calculated)
//         matchScore: rec ? rec.matchScore : 0 
//       };
//     });

//   }, [searchQuery, allStudents, currentUser, teamRecommendations]);


//   // --- Handlers ---
//   const startCreation = () => {
//     if (!currentUser) return
//     setIsCreating(true)
//     setDraftMembers([currentUser]) 
//     setDraftTeamName("")
//     setSearchQuery("") 
//   }

//   const toggleMemberSelection = (student: any) => {
//     const isSelected = draftMembers.find(m => m.id === student.id)
//     if (isSelected) {
//       if (student.id === currentUser?.id) {
//         toast.error("You cannot remove yourself from the team.")
//         return
//       }
//       setDraftMembers(prev => prev.filter(m => m.id !== student.id))
//     } else {
//       if (draftMembers.length >= 6) {
//         toast.error("Maximum team size is 6 members.")
//         return
//       }
//       setDraftMembers(prev => [...prev, student])
//     }
//   }

//   const saveTeam = () => {
//     if (!draftTeamName.trim()) {
//       toast.error("Please give your team a name.")
//       return
//     }
//     if (draftMembers.length < 2) {
//       toast.error("A team needs at least 2 members.")
//       return
//     }
//     const newTeam = {
//       id: crypto.randomUUID(),
//       name: draftTeamName,
//       members: draftMembers,
//       createdAt: new Date()
//     }
//     setMyTeams(prev => [...prev, newTeam])
//     setIsCreating(false)
//     setDraftMembers([])
//     setSearchQuery("")
//     toast.success(`Team "${draftTeamName}" created successfully!`)
//   }

//   const cancelCreation = () => {
//     setIsCreating(false)
//     setDraftMembers([])
//     setSearchQuery("")
//   }

//   const handleRegenerateRecommendations = () => {
//     if(!currentUser) return
//     const recommendations = generateTeamRecommendations(currentUser, allStudents)
//     setTeamRecommendations(recommendations)
//     setSearchQuery("")
//   }

//   if (!currentUser) return null

//   return (
//     <div className="space-y-8 pb-12 relative">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Team Builder</h1>
//           <p className="mt-1 text-muted-foreground">Build complementary teams for your projects</p>
//         </div>
//         <div className="flex gap-2">
//           {!isCreating && (
//             <Button onClick={startCreation} className="bg-primary text-primary-foreground">
//               <PlusIcon className="mr-2 h-5 w-5" />
//               Create New Team
//             </Button>
//           )}
//           <Button variant="outline" onClick={handleRegenerateRecommendations}>
//             <SparklesIcon className="mr-2 h-5 w-5" />
//             Regenerate Recs
//           </Button>
//         </div>
//       </div>

//       {/* My Teams List */}
//       {myTeams.length > 0 && !isCreating && (
//         <section>
//           <h2 className="mb-4 text-xl font-semibold text-foreground flex items-center">
//             <UserGroupIcon className="mr-2 h-5 w-5" />
//             My Teams ({myTeams.length})
//           </h2>
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {myTeams.map((team) => (
//               <Card 
//                 key={team.id} 
//                 onClick={() => setSelectedTeam(team)}
//                 className="glass rounded-2xl p-5 border-l-4 border-l-primary shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.02]"
//               >
//                 <div className="flex justify-between items-start mb-4 border-b pb-3">
//                   <div>
//                     <h3 className="font-bold text-lg">{team.name}</h3>
//                     <p className="text-xs text-muted-foreground">
//                       Created {team.createdAt.toLocaleDateString()}
//                     </p>
//                   </div>
//                   <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
//                     {team.members.length} Members
//                   </span>
//                 </div>
//                 <div className="flex flex-col gap-2">
//                   {team.members.slice(0, 3).map((member: any) => (
//                     <div key={member.id} className="flex items-center gap-2 text-sm text-foreground/80">
//                       <div className="h-1.5 w-1.5 rounded-full bg-primary" />
//                       {member.name}
//                     </div>
//                   ))}
//                 </div>
//               </Card>
//             ))}
//           </div>
//         </section>
//       )}

//       {/* Active Creation Area */}
//       {isCreating && (
//         <Card className="border-primary/50 bg-primary/5 rounded-2xl p-6 sticky top-4 z-20 backdrop-blur-md shadow-lg">
//           <div className="flex flex-col gap-4">
//             <div className="flex flex-col md:flex-row justify-between gap-4 items-end md:items-center">
//               <div className="w-full md:w-1/3">
//                 <label className="text-sm font-medium mb-1 block">Team Name</label>
//                 <Input 
//                   placeholder="Ex: Hackathon Alpha" 
//                   value={draftTeamName}
//                   onChange={(e) => setDraftTeamName(e.target.value)}
//                   className="bg-background/80"
//                 />
//               </div>
              
//               <div className="flex-1 flex flex-col items-center">
//                 <span className="text-sm font-medium mb-2">
//                   Selected Members ({draftMembers.length}/6)
//                 </span>
//                 <div className="flex flex-wrap justify-center gap-2">
//                   {draftMembers.map(m => (
//                     <div key={m.id} className="flex items-center gap-1 bg-background rounded-full pl-1 pr-3 py-1 text-xs border shadow-sm">
//                       <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px]">
//                         {m.name.charAt(0)}
//                       </div>
//                       {m.name}
//                       {m.id !== currentUser.id && (
//                         <button onClick={() => toggleMemberSelection(m)} className="ml-1 text-muted-foreground hover:text-red-500">
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <Button variant="ghost" onClick={cancelCreation}>Cancel</Button>
//                 <Button onClick={saveTeam}>Save Team</Button>
//               </div>
//             </div>

//             {/* Search Bar */}
//             <div className="relative mt-2">
//                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                <Input 
//                  placeholder="Try 'Rahul React' or 'Java Spring Boot'" 
//                  value={searchQuery}
//                  onChange={(e) => setSearchQuery(e.target.value)}
//                  className="pl-9 bg-background/90"
//                />
//                {searchQuery && (
//                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
//                    {filteredCandidates.length} results
//                  </div>
//                )}
//             </div>
//           </div>
//         </Card>
//       )}

//       {/* Candidates Grid */}
//       <div>
//         <h2 className="mb-4 text-xl font-semibold text-foreground flex items-center gap-2">
//           {searchQuery ? (
//              <>
//                <MagnifyingGlassIcon className="h-5 w-5" />
//                Search Results
//              </>
//           ) : (
//              isCreating ? "Select Teammates" : "Recommended Teammates"
//           )}
//         </h2>
        
//         {filteredCandidates.length === 0 ? (
//            <div className="text-center py-12 text-muted-foreground">
//              <p>No students found matching "{searchQuery}"</p>
//              <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">Clear Search</Button>
//            </div>
//         ) : (
//           <div className="grid gap-6 md:grid-cols-2">
//             {filteredCandidates.map((member) => {
//               // Ensure we pull full details from the combined list
//               const student = allStudents.find((s) => s.id === member.id) || member
//               if (!student) return null

//               const isSelected = draftMembers.some(m => m.id === member.id)

//               return (
//                 <Card 
//                   key={member.id} 
//                   className={`glass rounded-2xl p-6 transition-all duration-200 ${
//                     isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : ""
//                   }`}
//                 >
//                   <div className="mb-4 flex items-start justify-between">
//                     <div className="flex-1">
//                       <h3 className="font-semibold text-foreground flex items-center gap-2">
//                         {member.name}
//                         {isSelected && <CheckCircleIcon className="w-5 h-5 text-primary" />}
//                       </h3>
//                       <p className="text-sm text-muted-foreground">
//                         {student.department} • Year {student.year}
//                       </p>
//                       {/* Optional: Show ID for debugging duplicates */}
//                       {/* <p className="text-xs text-gray-400">ID: {student.id}</p> */}
//                     </div>
//                     {member.matchScore > 0 && (
//                       <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
//                         <span className="text-sm font-bold text-primary">{member.matchScore}%</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="mb-4">
//                     <h4 className="mb-2 text-sm font-medium text-foreground">Skills</h4>
//                     <div className="flex flex-wrap gap-1">
//                       {member.skills.slice(0, 6).map((skill: string) => {
//                         // Highlight matched skills
//                         const isSearchMatch = searchQuery && searchQuery.toLowerCase().split(/\s+/).some(t => t.length > 1 && skill.toLowerCase().includes(t));
//                         const isComplementary = !currentUser.skills.includes(skill)
                        
//                         return (
//                           <SkillBadge 
//                             key={skill} 
//                             skill={skill} 
//                             variant={isSearchMatch ? "matched" : (isComplementary ? "default" : "secondary")} 
//                             className={isSearchMatch ? "ring-2 ring-primary bg-primary/20 font-bold" : ""}
//                           />
//                         )
//                       })}
//                     </div>
//                   </div>

//                   <div className="mb-4 h-32">
//                     <h4 className="mb-2 text-sm font-medium text-foreground">Domain Strength</h4>
//                     <DomainChart domains={member.domains} />
//                   </div>

//                   <div className="flex gap-2">
//                     {isCreating ? (
//                       <Button 
//                         size="sm" 
//                         className="flex-1" 
//                         variant={isSelected ? "secondary" : "default"}
//                         onClick={() => toggleMemberSelection(member)}
//                       >
//                         {isSelected ? (
//                           <>
//                             <XMarkIcon className="mr-2 h-4 w-4" /> Remove
//                           </>
//                         ) : (
//                           <>
//                             <PlusIcon className="mr-2 h-4 w-4" /> Add to Team
//                           </>
//                         )}
//                       </Button>
//                     ) : (
//                       <Button size="sm" className="flex-1" onClick={startCreation}>
//                         <UserGroupIcon className="mr-2 h-4 w-4" />
//                         Start Team with {member.name.split(' ')[0]}
//                       </Button>
//                     )}
                    
//                     <Button size="sm" variant="outline">
//                       View Profile
//                     </Button>
//                   </div>
//                 </Card>
//               )
//             })}
//           </div>
//         )}
//       </div>

//       {/* Team Details Modal */}
//       {selectedTeam && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//           <Card className="w-full max-w-md bg-background shadow-2xl rounded-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
//             <div className="bg-primary/5 p-6 border-b flex justify-between items-start">
//               <div>
//                 <h3 className="text-xl font-bold text-foreground">{selectedTeam.name}</h3>
//                 <p className="text-sm text-muted-foreground">
//                   Created on {selectedTeam.createdAt.toLocaleDateString()}
//                 </p>
//               </div>
//               <button 
//                 onClick={() => setSelectedTeam(null)}
//                 className="p-1 rounded-full hover:bg-slate-200 transition-colors"
//               >
//                 <XMarkIcon className="w-6 h-6 text-muted-foreground" />
//               </button>
//             </div>
//             <div className="p-6">
//               <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">
//                 Team Members ({selectedTeam.members.length})
//               </h4>
//               <div className="space-y-3">
//                 {selectedTeam.members.map((member: any) => (
//                   <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
//                     <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
//                       {member.name.charAt(0)}
//                     </div>
//                     <div>
//                       <p className="font-medium text-foreground">{member.name}</p>
//                       <p className="text-xs text-muted-foreground">Member</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-6 pt-4 border-t flex justify-end">
//                 <Button variant="outline" onClick={() => setSelectedTeam(null)}>
//                   Close
//                 </Button>
//               </div>
//             </div>
//           </Card>
//         </div>
//       )}
//     </div>
//   )
// }

"use client"

import { useEffect, useState, useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DomainChart } from "@/components/ui/domain-chart"
import { SkillBadge } from "@/components/ui/skill-badge"
import { 
  UserGroupIcon, 
  SparklesIcon, 
  PlusIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  MagnifyingGlassIcon 
} from "@heroicons/react/24/outline"
import { toast } from "sonner"
import MiniSearch from 'minisearch'

// --- 1. Import Mock Data Directly ---
import { generateTeamRecommendations, mockStudents } from "@/lib/mock-data"
import { mockStudents2 } from "@/lib/mock-student-data"

export default function TeamBuilderPage() {
  // Only get currentUser and teamRecs from store. We ignore the store's 'students' list.
  const { currentUser, teamRecommendations, setTeamRecommendations } = useAppStore()
  
  // Local state
  const [myTeams, setMyTeams] = useState<any[]>([]) 
  const [isCreating, setIsCreating] = useState(false)
  const [draftTeamName, setDraftTeamName] = useState("")
  const [draftMembers, setDraftMembers] = useState<any[]>([])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<any>(null)

  // --- 2. Merge Mock Data Locally ---
  // This ensures we always have a clean list of S001-S014 + S101-S110
  const allStudents = useMemo(() => {
    return [...mockStudents, ...mockStudents2];
  }, []);

  // Generate recommendations if missing
  useEffect(() => {
    if (currentUser && teamRecommendations.length === 0) {
      // Pass our local 'allStudents' instead of the store's list
      const recommendations = generateTeamRecommendations(currentUser, allStudents)
      setTeamRecommendations(recommendations)
    }
  }, [currentUser, allStudents, teamRecommendations, setTeamRecommendations])

  // --- 3. Search Logic (Safe & Clean) ---
  const filteredCandidates = useMemo(() => {
    // If no search, return existing recommendations
    if (!searchQuery.trim()) {
      return teamRecommendations.filter(rec => allStudents.some(s => s.id === rec.id));
    }

    const miniSearch = new MiniSearch({
      fields: ['name', 'skills', 'department'], 
      storeFields: ['id', 'name', 'skills', 'department', 'year', 'domains'], 
      searchOptions: {
        boost: { name: 2, skills: 1.5, department: 1 }, 
        prefix: true, 
        fuzzy: 0.2    
      }
    });

    // Remove current user from search pool
    const searchPool = allStudents.filter(s => s.id !== currentUser?.id);

    // Index the data
    // Since we are using raw mock files (which we know are unique), 
    // we can skip the complex Map deduplication here.
    miniSearch.addAll(searchPool);

    // Perform Search
    let results = miniSearch.search(searchQuery, { combineWith: 'AND' });

    // Fallback to OR if no exact matches
    if (results.length === 0) {
       results = miniSearch.search(searchQuery, { combineWith: 'OR' });
    }

    // Map results to include matchScore
    return results.map((result: any) => {
      const rec = teamRecommendations.find(r => r.id === result.id);
      return {
        ...result, 
        matchScore: rec ? rec.matchScore : 0 
      };
    });

  }, [searchQuery, allStudents, currentUser, teamRecommendations]);


  // --- Handlers ---
  const startCreation = () => {
    if (!currentUser) return
    setIsCreating(true)
    setDraftMembers([currentUser]) 
    setDraftTeamName("")
    setSearchQuery("") 
  }

  const toggleMemberSelection = (student: any) => {
    const isSelected = draftMembers.find(m => m.id === student.id)
    if (isSelected) {
      if (student.id === currentUser?.id) {
        toast.error("You cannot remove yourself from the team.")
        return
      }
      setDraftMembers(prev => prev.filter(m => m.id !== student.id))
    } else {
      if (draftMembers.length >= 6) {
        toast.error("Maximum team size is 6 members.")
        return
      }
      setDraftMembers(prev => [...prev, student])
    }
  }

  const saveTeam = () => {
    if (!draftTeamName.trim()) {
      toast.error("Please give your team a name.")
      return
    }
    if (draftMembers.length < 2) {
      toast.error("A team needs at least 2 members.")
      return
    }
    const newTeam = {
      id: crypto.randomUUID(),
      name: draftTeamName,
      members: draftMembers,
      createdAt: new Date()
    }
    setMyTeams(prev => [...prev, newTeam])
    setIsCreating(false)
    setDraftMembers([])
    setSearchQuery("")
    toast.success(`Team "${draftTeamName}" created successfully!`)
  }

  const cancelCreation = () => {
    setIsCreating(false)
    setDraftMembers([])
    setSearchQuery("")
  }

  const handleRegenerateRecommendations = () => {
    if(!currentUser) return
    const recommendations = generateTeamRecommendations(currentUser, allStudents)
    setTeamRecommendations(recommendations)
    setSearchQuery("")
  }

  if (!currentUser) return null

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Builder</h1>
          <p className="mt-1 text-muted-foreground">Build complementary teams for your projects</p>
        </div>
        <div className="flex gap-2">
          {!isCreating && (
            <Button onClick={startCreation} className="bg-primary text-primary-foreground">
              <PlusIcon className="mr-2 h-5 w-5" />
              Create New Team
            </Button>
          )}
          <Button variant="outline" onClick={handleRegenerateRecommendations}>
            <SparklesIcon className="mr-2 h-5 w-5" />
            Regenerate Recs
          </Button>
        </div>
      </div>

      {/* My Teams List */}
      {myTeams.length > 0 && !isCreating && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground flex items-center">
            <UserGroupIcon className="mr-2 h-5 w-5" />
            My Teams ({myTeams.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myTeams.map((team) => (
              <Card 
                key={team.id} 
                onClick={() => setSelectedTeam(team)}
                className="glass rounded-2xl p-5 border-l-4 border-l-primary shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start mb-4 border-b pb-3">
                  <div>
                    <h3 className="font-bold text-lg">{team.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Created {team.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                    {team.members.length} Members
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {team.members.slice(0, 3).map((member: any) => (
                    <div key={member.id} className="flex items-center gap-2 text-sm text-foreground/80">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {member.name}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Active Creation Area */}
      {isCreating && (
        <Card className="border-primary/50 bg-primary/5 rounded-2xl p-6 sticky top-4 z-20 backdrop-blur-md shadow-lg">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-end md:items-center">
              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium mb-1 block">Team Name</label>
                <Input 
                  placeholder="Ex: Hackathon Alpha" 
                  value={draftTeamName}
                  onChange={(e) => setDraftTeamName(e.target.value)}
                  className="bg-background/80"
                />
              </div>
              
              <div className="flex-1 flex flex-col items-center">
                <span className="text-sm font-medium mb-2">
                  Selected Members ({draftMembers.length}/6)
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {draftMembers.map(m => (
                    <div key={m.id} className="flex items-center gap-1 bg-background rounded-full pl-1 pr-3 py-1 text-xs border shadow-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px]">
                        {m.name.charAt(0)}
                      </div>
                      {m.name}
                      {m.id !== currentUser.id && (
                        <button onClick={() => toggleMemberSelection(m)} className="ml-1 text-muted-foreground hover:text-red-500">
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={cancelCreation}>Cancel</Button>
                <Button onClick={saveTeam}>Save Team</Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mt-2">
               <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                 placeholder="Search candidates... (e.g. 'Rahul React')" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-9 bg-background/90"
               />
               {searchQuery && (
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                   {filteredCandidates.length} results
                 </div>
               )}
            </div>
          </div>
        </Card>
      )}

      {/* Candidates Grid */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground flex items-center gap-2">
          {searchQuery ? (
             <>
               <MagnifyingGlassIcon className="h-5 w-5" />
               Search Results
             </>
          ) : (
             isCreating ? "Select Teammates" : "Recommended Teammates"
          )}
        </h2>
        
        {filteredCandidates.length === 0 ? (
           <div className="text-center py-12 text-muted-foreground">
             <p>No students found matching "{searchQuery}"</p>
             <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">Clear Search</Button>
           </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredCandidates.map((member) => {
              // Ensure we pull full details from our local allStudents list
              const student = allStudents.find((s) => s.id === member.id) || member
              if (!student) return null

              const isSelected = draftMembers.some(m => m.id === member.id)

              return (
                <Card 
                  key={member.id} 
                  className={`glass rounded-2xl p-6 transition-all duration-200 ${
                    isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {member.name}
                        {isSelected && <CheckCircleIcon className="w-5 h-5 text-primary" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {student.department} • Year {student.year}
                      </p>
                    </div>
                    {member.matchScore > 0 && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">{member.matchScore}%</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium text-foreground">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 6).map((skill: string) => {
                        // Highlight matched skills
                        const isSearchMatch = searchQuery && searchQuery.toLowerCase().split(/\s+/).some(t => t.length > 1 && skill.toLowerCase().includes(t));
                        const isComplementary = !currentUser.skills.includes(skill)
                        
                        return (
                          <SkillBadge 
                            key={skill} 
                            skill={skill} 
                            variant={isSearchMatch ? "matched" : (isComplementary ? "default" : "secondary")} 
                            className={isSearchMatch ? "ring-2 ring-primary bg-primary/20 font-bold" : ""}
                          />
                        )
                      })}
                    </div>
                  </div>

                  <div className="mb-4 h-32">
                    <h4 className="mb-2 text-sm font-medium text-foreground">Domain Strength</h4>
                    <DomainChart domains={member.domains} />
                  </div>

                  <div className="flex gap-2">
                    {isCreating ? (
                      <Button 
                        size="sm" 
                        className="flex-1" 
                        variant={isSelected ? "secondary" : "default"}
                        onClick={() => toggleMemberSelection(member)}
                      >
                        {isSelected ? (
                          <>
                            <XMarkIcon className="mr-2 h-4 w-4" /> Remove
                          </>
                        ) : (
                          <>
                            <PlusIcon className="mr-2 h-4 w-4" /> Add to Team
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1" onClick={startCreation}>
                        <UserGroupIcon className="mr-2 h-4 w-4" />
                        Start Team with {member.name.split(' ')[0]}
                      </Button>
                    )}
                    
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-background shadow-2xl rounded-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <div className="bg-primary/5 p-6 border-b flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedTeam.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Created on {selectedTeam.createdAt.toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedTeam(null)}
                className="p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6">
              <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">
                Team Members ({selectedTeam.members.length})
              </h4>
              <div className="space-y-3">
                {selectedTeam.members.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">Member</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button variant="outline" onClick={() => setSelectedTeam(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}