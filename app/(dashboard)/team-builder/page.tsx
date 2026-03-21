"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DomainChart } from "@/components/ui/domain-chart"
import { SkillBadge } from "@/components/ui/skill-badge"
import { 
  UserGroupIcon, 
  SparklesIcon, 
  PlusIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  CheckIcon,
  PaperAirplaneIcon, // Added for Sent Invitations
} from "@heroicons/react/24/outline"
import { toast } from "sonner"
import { useUser } from "@/contexts/UserContext"
import { useAppStore } from "@/lib/store"
import MiniSearch from 'minisearch'

// Helper function to transform domains array to object format
const transformDomains = (domainsArray: any[]) => {
  const domainsObj = { web: 0, ml: 0, cp: 0, appDev: 0, cyber: 0 };
  
  domainsArray?.forEach(domain => {
    const name = domain.name.toLowerCase();
    if (name.includes('web')) domainsObj.web = domain.value;
    else if (name.includes('machine learning') || name.includes('ai')) domainsObj.ml = domain.value;
    else if (name.includes('competitive')) domainsObj.cp = domain.value;
    else if (name.includes('app')) domainsObj.appDev = domain.value;
    else if (name.includes('cyber')) domainsObj.cyber = domain.value;
  });
  
  return domainsObj;
};

// Helper to format date to DD/MM/YY
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

export default function TeamBuilderPage() {
  const addNotification = useAppStore((state) => state.addNotification)
  const { user: currentUser, loading: userLoading } = useUser()
  
  // Local state for Team Creation
  const [myTeams, setMyTeams] = useState<any[]>([]) 
  const [isCreating, setIsCreating] = useState(false)
  const [draftTeamName, setDraftTeamName] = useState("")
  const [draftDescription, setDraftDescription] = useState("")
  const [draftMembers, setDraftMembers] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [groupCounts, setGroupCounts] = useState<Record<string, number>>({})

  // State for the Search and Team Details Popup
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<any>(null)

  // State for Candidate Profile Modal
  const [candidateProfile, setCandidateProfile] = useState<any>(null)
  const [candidateGroupData, setCandidateGroupData] = useState<{ count: number, groups: any[] }>({ count: 0, groups: [] })
  const [isFetchingGroups, setIsFetchingGroups] = useState(false)

  // State for Pending & Sent Invitations
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([])
  const [sentInvitations, setSentInvitations] = useState<any[]>([])

  // State for the Welcome Modal after accepting an invite
  const [newlyJoinedTeam, setNewlyJoinedTeam] = useState<{ group_name: string, members: any[] } | null>(null)

  // Fetch Students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/students/${currentUser?.id}`, { credentials: "include" });
        const data = await response.json();
        if (response.ok) {
          const transformedStudents = data.map((student: any) => ({
            ...student,
            domains: transformDomains(student.domains),
            skills: student.skills || [],
            matchScore: Math.floor(Math.random() * 40) + 60 
          }));
          setStudents(transformedStudents);
        }
      } catch (error) {
        toast.error("Failed to load students from database.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Fetch My Teams
  const fetchMyTeams = async () => {
    if (!currentUser?.id) return;
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/team-builder/get-my-teams/${currentUser.id}`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setMyTeams(data);
      }
    } catch (error) {
      toast.error("Connection lost. Could not sync teams.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTeams();
  }, [currentUser?.id]);

  // Fetch Pending & Sent Invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      if (!currentUser?.id) return;
      try {
        // Fetch Received Pending Invitations
        const pendingRes = await fetch(`http://localhost:5000/api/team-builder/get-pending-invitations/${currentUser.id}`);
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json();
          setPendingInvitations(pendingData);
        }

        // Fetch Sent Invitations
        const sentRes = await fetch(`http://localhost:5000/api/team-builder/get-sent-invitations/${currentUser.id}`);
        if (sentRes.ok) {
          const sentData = await sentRes.json();
          setSentInvitations(sentData);
        }
      } catch (error) {
        console.error("Error fetching invitations:", error);
      }
    };
    fetchInvitations();
  }, [currentUser?.id]);

  // --- MiniSearch Logic ---
  const filteredCandidates = useMemo(() => {
    const validStudents = students.filter(s => s.name && s.id !== currentUser?.id);
    if (!searchQuery.trim()) return validStudents;

    const miniSearch = new MiniSearch({
      fields: ['name', 'skills', 'department'], 
      storeFields: ['id'], 
      searchOptions: { boost: { name: 2, skills: 1.5, department: 1 }, prefix: true, fuzzy: 0.2 }
    });
    miniSearch.addAll(validStudents);

    let results = miniSearch.search(searchQuery, { combineWith: 'AND' });
    if (results.length === 0) results = miniSearch.search(searchQuery, { combineWith: 'OR' });

    return results.map((result: any) => validStudents.find(s => s.id === result.id)).filter(Boolean); 
  }, [searchQuery, students, currentUser]);

  // --- Handlers ---
  const startCreation = () => {
    if (!currentUser) return
    if (myTeams.length >= 2) { toast.error("You are already part of two teams."); return; }
    const formattedUser = { ...currentUser, name: currentUser.name || currentUser.full_name || currentUser.username }
    setIsCreating(true)
    setDraftMembers([formattedUser]) 
    setDraftTeamName("")
    setDraftDescription("")
    setSearchQuery("") 
  }

  const ensureGroupCount = async (student: any) => {
    const reg = student.registration_number
    if (groupCounts[reg] !== undefined) return groupCounts[reg]
    try {
      const response = await fetch(`http://localhost:5000/api/team-builder/get-student-groups/${reg}`)
      if (response.ok) {
        const data = await response.json()
        setGroupCounts(prev => ({ ...prev, [reg]: data.count }))
        return data.count
      }
    } catch (_) {
      /* ignore transient errors */
    }
    return 0
  }

  const toggleMemberSelection = async (student: any) => {
    const isSelected = draftMembers.find(m => m.id === student.id)
    if (isSelected) {
      if (student.id === currentUser?.id) {
        toast.error("You cannot remove yourself from the team."); return;
      }
      setDraftMembers(prev => prev.filter(m => m.id !== student.id))
    } else {
      if (draftMembers.length >= 6) {
        toast.error("Maximum team size is 6 members."); return;
      }
      const count = await ensureGroupCount(student)
      if (count >= 2) {
        toast.error("Cannot add. Student is already part of two teams.")
        return
      }
      setDraftMembers(prev => [...prev, student])
    }
  }

  // const saveTeam = async () => {
  //   if (!draftTeamName.trim()) { toast.error("Please give your team a name."); return; }
  //   if (draftMembers.length < 2) { toast.error("A team needs at least 2 members."); return; }
  //   if (!currentUser) { toast.error("User not authenticated."); return; }

  //   try {
  //     const response = await fetch('http://localhost:5000/api/team-builder/create-team', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       credentials: "include",
  //       body: JSON.stringify({
  //         group_name: draftTeamName,
  //         student_ids: draftMembers.filter(m => m.id !== currentUser.id).map(m => m.registration_number),
  //         creator_user_id: currentUser.id 
  //       })
  //     });

  //     const data = await response.json();
  //     if (response.ok) {
  //       toast.success(`Team initiated! ID: ${data.group_id}`);
  //       fetchMyTeams(); // Refresh teams
        
  //       // Refresh Sent Invitations to show the newly dispatched invites
  //       const sentRes = await fetch(`http://localhost:5000/api/team-builder/sent-invitations/${currentUser.id}`);
  //       if (sentRes.ok) setSentInvitations(await sentRes.json());

  //       setIsCreating(false);
  //       setDraftMembers([]);
  //       setDraftTeamName("");
  //       setSearchQuery(""); 
  //     } else {
  //       toast.error(data.error || "Failed to create team");
  //     }
  //   } catch (error) {
  //     toast.error("Connection error. Please try again.");
  //   }
  // }

  const saveTeam = async () => {
  if (!draftTeamName.trim()) { toast.error("Please give your team a name."); return; }
  if (draftMembers.length < 2) { toast.error("A team needs at least 2 members."); return; }
  if (!currentUser) { toast.error("User not authenticated."); return; }
  if (myTeams.length >= 2) { toast.error("You are already part of two teams."); return; }

  try {
    // Step 1: Create the Team
    const response = await fetch('http://localhost:5000/api/team-builder/create-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
      body: JSON.stringify({
        group_name: draftTeamName,
        student_ids: draftMembers.filter(m => m.id !== currentUser.id).map(m => m.registration_number),
        creator_user_id: currentUser.id 
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      const newGroupId = data.group_id;

      // Step 2: Send Invitations to each selected member
      // Filter out the current user (creator) so they don't invite themselves
      const invitees = draftMembers.filter(m => m.id !== currentUser.id);

      const invitePromises = invitees.map(member => 
        fetch('http://localhost:5000/api/team-builder/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            group_id: newGroupId,
            receiver_registration_number: member.registration_number,
            sender_user_id: currentUser.id,
            description: draftDescription.trim() || null,
          })
        })
      );

      // Wait for all invitations to be dispatched
      await Promise.all(invitePromises);

      toast.success(`Team "${draftTeamName}" created and invitations sent!`);
      
      // Refresh UI
      fetchMyTeams();
      setIsCreating(false);
      setDraftMembers([]);
      setDraftTeamName("");
      setDraftDescription("");
      setSearchQuery(""); 
    } else {
      toast.error(data.error || "Failed to create team");
    }
  } catch (error) {
    console.error("Save Team Error:", error);
    toast.error("Connection error. Please try again.");
  }
}

  const cancelCreation = () => {
    setIsCreating(false); setDraftMembers([]); setSearchQuery(""); 
  }

  const handleRegenerateRecommendations = () => {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    setStudents(shuffled.map(student => ({ ...student, matchScore: Math.floor(Math.random() * 40) + 60 })));
    setSearchQuery("") 
  }

  const openCandidateProfile = async (student: any) => {
    setCandidateProfile(student);
    setIsFetchingGroups(true);
    setCandidateGroupData({ count: 0, groups: [] }); 
    
    try {
      const response = await fetch(`http://localhost:5000/api/team-builder/get-student-groups/${student.registration_number}`);
      if (response.ok) {
        const data = await response.json();
        setCandidateGroupData(data); 
        setGroupCounts(prev => ({ ...prev, [student.registration_number]: data.count }))
      } else {
        toast.error("Failed to fetch candidate's groups.");
      }
    } catch (error) {
      toast.error("Network error while checking groups.");
    } finally {
      setIsFetchingGroups(false);
    }
  }

  // Accept Invitation Handler
  const handleAcceptInvitation = async (invitationId: number, groupName: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/team-builder/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitation_id: invitationId })
      });
      
      if (response.ok) {
        const data = await response.json(); 
        toast.success(data.message || "Invitation accepted!");
        
        setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        fetchMyTeams();
        
        // Trigger Welcome Modal if members array is returned
        if (data.members && data.members.length > 0) {
          setNewlyJoinedTeam({
            group_name: groupName,
            members: data.members 
          });
        }

      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to accept invitation.");
      }
    } catch (error) {
      toast.error("Network error.");
    }
  };

  // Decline Invitation Handler
  const handleDeclineInvitation = async (invitation: any) => {
    try {
      const response = await fetch(`http://localhost:5000/api/team-builder/decline-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitation_id: invitation.id })
    });
      
      if (response.ok) {
        const data = await response.json();
        toast.success("Invitation declined.");
        setPendingInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
        
        const groupName = data.group?.group_name || `Group #${invitation.group_id}`;
        const declinerName = currentUser?.name || currentUser?.full_name || currentUser?.username || "A student";
        
        // Create notification for the sender using the response data
        addNotification({
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: "Invitation Declined",
          message: `${declinerName} has declined your invitation to join ${groupName}.`,
          type: "warning",
          read: false,
          timestamp: new Date().toISOString()
        });
      } else {
        toast.error("Failed to decline invitation.");
      }
    } catch (error) {
      toast.error("Network error.");
    }
  };

  if (userLoading) return <div className="flex items-center justify-center h-96"><div className="text-lg">Loading user...</div></div>
  if (!currentUser) return <div className="flex items-center justify-center h-96"><div className="text-lg">Please log in to access team builder.</div></div>

  return (
    <div className="space-y-8 pb-12 relative">
      {/* --- Header --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Builder</h1>
          <p className="mt-1 text-muted-foreground">Build complementary teams for your projects</p>
        </div>
        <div className="flex gap-2">
          {!isCreating && (
                <Button onClick={startCreation} disabled={myTeams.length >= 2} className="bg-primary text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed">
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

      {/* --- Pending Invitations (Received) --- */}
      {pendingInvitations.length > 0 && (
        <section className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center">
            <EnvelopeIcon className="mr-2 h-5 w-5 text-primary" />
            Inbox: Pending Invitations ({pendingInvitations.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingInvitations.map((invitation) => {
              const groupName = invitation.group?.group_name || `Group #${invitation.group_id}`;
              const atLimit = myTeams.length >= 2;
              return (
                <Card key={invitation.id} className="p-4 flex flex-col justify-between shadow-sm bg-background border border-border">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground">{groupName}</h3>
                      <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        {formatDate(invitation.created_at)}
                      </span>
                    </div>
                    {invitation.description && (
                      <p className="text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-md p-2 leading-relaxed">
                        {invitation.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Invited by: <span className="font-medium text-foreground">
                        {invitation.sender?.first_name || invitation.sender?.registration_number}
                      </span>
                    </p>
                    {atLimit && (
                      <p className="mt-2 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
                        You cannot accept more invites. You are already in 2 teams.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={atLimit}
                      onClick={() => handleAcceptInvitation(invitation.id, groupName)}
                    >
                      <CheckIcon className="w-4 h-4 mr-1" /> Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeclineInvitation(invitation)}
                    >
                      <XMarkIcon className="w-4 h-4 mr-1" /> Decline
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* --- Sent Invitations Status --- */}
      {sentInvitations.length > 0 && (
        <section className="bg-secondary/10 rounded-2xl p-6 border border-secondary/30">
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center">
            <PaperAirplaneIcon className="mr-2 h-5 w-5 text-secondary-foreground" />
            Sent Invitations Status
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sentInvitations.map((invitation) => {
              const groupName = invitation.group?.group_name || `Group #${invitation.group_id}`;
              const receiverName = invitation.receiver?.first_name || invitation.receiver?.registration_number;
              
              // Badge styling logic
              let statusColor = "bg-gray-100 text-gray-700 border-gray-200";
              if (invitation.status === "PENDING") statusColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
              if (invitation.status === "ACCEPTED") statusColor = "bg-green-100 text-green-800 border-green-200";
              if (invitation.status === "REJECTED") statusColor = "bg-red-100 text-red-800 border-red-200";

              return (
                <Card key={invitation.id} className="p-4 flex flex-col justify-between shadow-sm bg-background border border-border">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground">{groupName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                        {invitation.status}
                      </span>
                    </div>
                    {invitation.description && (
                      <p className="text-sm text-muted-foreground bg-secondary/20 border border-secondary/40 rounded-md p-2 leading-relaxed">
                        {invitation.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Sent to: <span className="font-medium text-foreground">{receiverName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last updated: {formatDate(invitation.updated_at)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* --- Active Creation Staging Area --- */}
      {isCreating && (
        <Card className="border-primary/50 bg-primary/5 rounded-2xl p-6 sticky top-4 z-10 backdrop-blur-md shadow-lg">
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

              <div className="w-full md:w-2/3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Invite Message</label>
                  <span className="text-xs text-muted-foreground">Optional • Shown to invitees</span>
                </div>
                <Textarea
                  placeholder="Tell your teammates why this team is awesome, what the project is about, expectations, timelines..."
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value.slice(0, 280))}
                  className="bg-background/80 min-h-24"
                />
                <div className="text-right text-[11px] text-muted-foreground mt-1">{draftDescription.length}/280</div>
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

            {/* --- MiniSearch Bar --- */}
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

      {/* --- My Teams List --- */}
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
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-mono text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20 w-fit">
                      ID: {team.id}
                    </p>
                  </div>
                </div>
                <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                  {team.members.length} Members
                </span>
              </div>

                <div className="flex flex-col gap-2">
                  {team.members.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-2 text-sm text-foreground/80">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {member.name || member.first_name || member.registration_number}
                    </div>
                  ))}
                </div>

              {team.isCreator && (
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Your finalize logic here
                      toast.info(`Finalizing ${team.name}...`);
                    }}
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Finalize
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Logic to open "Add Member" state
                      setIsCreating(true);
                      setDraftTeamName(team.name);
                      setDraftMembers(team.members);
                    }}
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* --- Recommendations Grid --- */}
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
        
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </Card>
            ))}
          </div>
        ) : filteredCandidates.length === 0 ? (
           <div className="text-center py-12 text-muted-foreground">
             <p>No students found matching "{searchQuery}"</p>
             <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">Clear Search</Button>
           </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredCandidates.map((student: any) => {
              if (!student) return null

              const isSelected = draftMembers.some(m => m.id === student.id)
              const cachedCount = groupCounts[student.registration_number]
              const atCapacity = cachedCount !== undefined && cachedCount >= 2
              const creatorAtLimit = myTeams.length >= 2

              return (
                <Card 
                  key={student.id} 
                  className={`glass rounded-2xl p-6 transition-all duration-200 ${
                    isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {student.name}
                        {isSelected && <CheckCircleIcon className="w-5 h-5 text-primary" />}
                        {atCapacity && (
                          <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">In 2 teams</span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {student.department || 'No Department'} • Year {student.year}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">{student.matchScore}%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium text-foreground">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {student.skills && student.skills.length > 0 ? (
                        student.skills.slice(0, 6).map((skill: string, index: number) => {
                          const isSearchMatch = searchQuery && searchQuery.toLowerCase().split(/\s+/).some(t => t.length > 1 && skill.toLowerCase().includes(t));
                          const isComplementary = !currentUser?.skills?.includes(skill);

                          return (
                            <SkillBadge 
                              key={`${skill}-${index}`} 
                              skill={skill} 
                              variant={isSearchMatch ? "matched" : (isComplementary ? "default" : "secondary")} 
                              className={isSearchMatch ? "ring-2 ring-primary bg-primary/20 font-bold" : ""}
                            />
                          );
                        })
                      ) : (
                        <span className="text-sm text-muted-foreground">No skills listed</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 h-32">
                    <h4 className="mb-2 text-sm font-medium text-foreground">Domain Strength</h4>
                    <DomainChart domains={student.domains} />
                  </div>

                  <div className="flex gap-2">
                    {isCreating ? (
                      <Button 
                        size="sm" 
                        className="flex-1" 
                        variant={isSelected ? "secondary" : "default"}
                        disabled={atCapacity && !isSelected}
                        onClick={() => toggleMemberSelection(student)}
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
                      <Button 
                        size="sm" 
                        className="flex-1" 
                        disabled={atCapacity || creatorAtLimit}
                        onClick={startCreation}
                      >
                        <UserGroupIcon className="mr-2 h-4 w-4" />
                        {atCapacity || creatorAtLimit
                          ? "Cannot create team (in 2 teams)"
                          : `Start Team with ${student.name?.split(' ')[0]}`}
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openCandidateProfile(student)}
                    >
                      View Profile
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* --- Team Details Modal / Popup (Existing) --- */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-background shadow-2xl rounded-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <div className="bg-primary/5 p-6 border-b flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedTeam.name}</h3>
                <p className="text-[10px] font-mono text-primary bg-primary/5 px-2 py-0.5 mt-1 rounded border border-primary/20 w-fit">
                  Group ID: {selectedTeam.id}
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
                {selectedTeam.members.map((member: any, idx: number) => (
                  <div key={member.id || idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {(member.name || member.first_name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name || member.first_name || member.registration_number}</p>
                      <p className="text-xs text-muted-foreground">Member</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* --- Candidate Profile Modal --- */}
      {candidateProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-background shadow-2xl rounded-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <div className="bg-primary/5 p-6 border-b flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-foreground">{candidateProfile.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {candidateProfile.department || "No Department"} • Year {candidateProfile.year}
                </p>
              </div>
              <button 
                onClick={() => setCandidateProfile(null)} 
                className="p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-secondary/20 rounded-lg p-4 border border-secondary">
                <div className="flex items-center gap-3 mb-2">
                  <UserGroupIcon className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Current Enrollments</h4>
                </div>
                
                {isFetchingGroups ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      This student is currently a member of <span className="font-bold text-foreground">{candidateGroupData.count}</span> group(s).
                    </p>
                    {candidateGroupData.count > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {candidateGroupData.groups.map((group: any) => (
                          <span 
                            key={group.group_id} 
                            className="bg-background border shadow-sm px-3 py-1 rounded-md text-xs font-medium"
                          >
                            {group.group_name || `Group #${group.group_id}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* --- Welcome to Team Modal (Post-Acceptance) --- */}
      {newlyJoinedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-background shadow-2xl rounded-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 text-center">
            <div className="bg-primary/10 p-8 flex flex-col items-center border-b">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg ring-4 ring-primary/20">
                <SparklesIcon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Welcome to the Team!</h3>
              <p className="text-muted-foreground mt-2">
                You are now an official member of <span className="font-semibold text-foreground">{newlyJoinedTeam.group_name}</span>.
              </p>
            </div>

            <div className="p-6">
              <h4 className="text-sm font-semibold mb-4 text-left uppercase tracking-wider text-muted-foreground border-b pb-2">
                Your New Teammates ({newlyJoinedTeam.members.length})
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {newlyJoinedTeam.members.map((member: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {(member.first_name || member.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground text-sm">
                        {member.first_name ? `${member.first_name} ${member.last_name || ''}` : (member.name || member.registration_number)}
                      </p>
                      {member.primary_email && (
                         <p className="text-xs text-muted-foreground">{member.primary_email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full mt-6"
                onClick={() => setNewlyJoinedTeam(null)}
              >
                Awesome, let's go!
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  )
}