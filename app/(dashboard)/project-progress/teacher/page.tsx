// "use client";

// import { useState } from "react";
// import {
//   Users,
//   ClipboardList,
//   TrendingUp,
//   BookOpen,
//   ArrowLeft,
// } from "lucide-react";

// import ProjectDashboardView from "../../../../components/project-details";
// import ProjectTimeline from "../../../../components/project-timeline";
// import ChatLogbook from "../../../../components/chat-logbook";

// enum PhaseStatus {
//   OPEN = "OPEN",
//   SUBMITTED = "SUBMITTED",
//   CLOSED = "CLOSED",
//   LOCKED = "LOCKED",
// }

// interface Phase {
//   phase_id: number;
//   project_id: string;
//   phase_name: string;
//   phase_description: string;
//   start_date: string;
//   end_date: string;
//   status: PhaseStatus;
// }

// interface Project {
//   id: string;
//   project_id: string;
//   title: string;
//   description: string;
//   repo_url: string;
//   groupName: string;
//   members: { name: string; role: string }[];
//   phases: Phase[];
// }

// export default function TeacherDashboard() {
//   const [selectedProject, setSelectedProject] =
//     useState<Project | null>(null);

//   const [isLogbookOpen, setIsLogbookOpen] =
//     useState(false);

//   const projects: Project[] = [
//     {
//       id: "101",
//       project_id: "101",
//       title: "AI-Powered Campus Management System",
//       description: "AI-based intelligent campus system.",
//       repo_url:
//         "https://github.com/team-alpha/campus-management-system",
//       groupName: "Team Alpha",
//       members: [
//         { name: "Alex Kumar", role: "Team Lead" },
//         { name: "Sarah Johnson", role: "Backend Developer" },
//       ],
//       phases: [
//         {
//           phase_id: 1,
//           project_id: "101",
//           phase_name: "Requirements Gathering",
//           phase_description: "System architecture.",
//           start_date: "2025-01-15",
//           end_date: "2025-02-01",
//           status: PhaseStatus.CLOSED,
//         },
//         {
//           phase_id: 2,
//           project_id: "101",
//           phase_name: "Backend Development",
//           phase_description: "API setup.",
//           start_date: "2025-02-02",
//           end_date: "2025-03-15",
//           status: PhaseStatus.SUBMITTED,
//         },
//       ],
//     },
//   ];

//   const handleStatusChange = (
//     phaseId: number,
//     newStatus: PhaseStatus
//   ) => {
//     console.log(
//       `Teacher updated Phase ${phaseId} to ${newStatus}`
//     );
//   };

//   if (selectedProject) {
//     const closedCount =
//       selectedProject.phases.filter(
//         (p) => p.status === PhaseStatus.CLOSED
//       ).length;

//     const progress =
//       (closedCount /
//         selectedProject.phases.length) *
//       100;

//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-5xl mx-auto space-y-6">
//           <button
//             onClick={() => setSelectedProject(null)}
//             className="flex items-center text-gray-600 hover:text-blue-600 font-medium"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Dashboard
//           </button>

//           <ProjectDashboardView
//             projectData={selectedProject}
//             userRole="TEACHER"
//           />

//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-sm font-semibold mb-2 flex items-center">
//                 <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
//                 Project Documentation
//               </h3>
//               <button
//                 onClick={() => setIsLogbookOpen(true)}
//                 className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
//               >
//                 Open Smart Logbook
//               </button>
//             </div>

//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-sm font-semibold mb-2 flex items-center">
//                 <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
//                 Live Progress
//               </h3>
//               <p className="text-3xl font-bold text-blue-600">
//                 {Math.round(progress)}%
//               </p>
//               <div className="w-full bg-gray-200 h-3 rounded-full mt-2">
//                 <div
//                   className="bg-blue-600 h-3 rounded-full"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//             </div>
//           </div>

//           <ProjectTimeline
//             phases={selectedProject.phases}
//             userRole="TEACHER"
//             onStatusChange={handleStatusChange}
//           />
//         </div>

//         <ChatLogbook
//           isOpen={isLogbookOpen}
//           onClose={() => setIsLogbookOpen(false)}
//           projectData={selectedProject}
//           userRole="TEACHER"
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-5xl mx-auto">
//         <h1 className="text-3xl font-bold mb-6">
//           All Projects
//         </h1>

//         {projects.map((project) => (
//           <div
//             key={project.id}
//             onClick={() => setSelectedProject(project)}
//             className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition mb-4"
//           >
//             <h2 className="text-lg font-semibold">
//               {project.title}
//             </h2>
//             <p className="text-sm text-gray-500">
//               {project.groupName}
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { Users, ClipboardList, TrendingUp, BookOpen, ArrowLeft } from 'lucide-react';
import ProjectDashboardView from '../../../../components/project-details';
import ProjectTimeline from '../../../../components/project-timeline';
import ChatLogbook from '../../../../components/chat-logbook';
import ProjectAnalyticsRAG from '@/components/project-analytics-rag';
import { useUser } from "@/contexts/UserContext"

// 1. Updated Enums to include 'SUBMITTED'
enum PhaseStatus {
  OPEN = 'OPEN',
  SUBMITTED = 'SUBMITTED',
  CLOSED = 'CLOSED',
  LOCKED = 'LOCKED',
}

// 2. Comprehensive Interfaces
interface Phase {
  phase_id: number;
  project_id: string;
  phase_name: string;
  phase_description: string;
  start_date: string;
  end_date: string;
  status: PhaseStatus;
  comments?: string | null;
}

interface Project {
  id: string;
  project_id: string;
  title: string;
  description: string;
  repo_url: string;
  groupName: string; // Used as team name
  members: { name: string; role: string }[];
  startDate: string;
  expectedEnd: string;
  status: 'ongoing' | 'completed' | 'pending';
  phases: Phase[];
}

export default function TeacherDashboard() {
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
   const { user: currentUser, loading: userLoading } = useUser()
  // Filter States
  const [projectFilter, setProjectFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [leadFilter, setLeadFilter] = useState('');

  // 3. Merged Sample Data (Replacing static data with dynamic project array)
  const projects: Project[] = [
    {
      id: '101',
      project_id: '101',
      title: 'AI-Powered Campus Management System',
      description: 'Developing an intelligent campus management system that uses machine learning to optimize resource allocation.',
      repo_url: 'https://github.com/team-alpha/campus-management-system',
      groupName: 'Team Alpha',
      startDate: '2025-01-15',
      expectedEnd: '2025-05-30',
      status: 'ongoing',
      members: [
        { name: "Trisha Khimesra", role: "Team Lead" },
        { name: "Aastha Shah", role: "Backend Developer" },
        { name: "Neeraj Magdum", role: "Frontend Developer" },
        { name: "Akshit Mishra", role: "ML Engineer" },
      ],
      phases: [
        {
          phase_id: 1,
          project_id: '101',
          phase_name: 'Requirements Gathering',
          phase_description: 'Defining system architecture and user stories.',
          start_date: '2025-01-15',
          end_date: '2025-02-01',
          status: PhaseStatus.CLOSED,
          comments: 'Completed 2 days early.'
        },
        {
          phase_id: 2,
          project_id: '101',
          phase_name: 'Backend Development',
          phase_description: 'Setting up Prisma schema and API endpoints.',
          start_date: '2025-02-02',
          end_date: '2025-03-15',
          status: PhaseStatus.SUBMITTED,
          comments: null
        },
        {
          phase_id: 3,
          project_id: '101',
          phase_name: 'Frontend Development',
          phase_description: 'Developing React UI components.',
          start_date: '2025-03-16',
          end_date: '2025-04-10',
          status: PhaseStatus.OPEN,
          comments: 'UI design in progress.'
        },
      ],
    },
    {
      id: '102',
      project_id: '102',
      title: 'Smart Library Management System',
      description: 'RFID and AI based library management and tracking.',
      repo_url: 'https://github.com/team-beta/library-system',
      groupName: 'Team Beta',
      startDate: '2025-01-10',
      expectedEnd: '2025-04-30',
      status: 'ongoing',
      members: [
        { name: 'Trisha Khimesra', role: 'Team Lead' },
        { name: 'Aastha Shah', role: 'Developer' },
      ],
      phases: [
        {
          phase_id: 1,
          project_id: '102',
          phase_name: 'Planning',
          phase_description: 'Initial planning',
          start_date: '2025-01-10',
          end_date: '2025-01-20',
          status: PhaseStatus.CLOSED,
        },
        {
          phase_id: 2,
          project_id: '102',
          phase_name: 'Development',
          phase_description: 'Core coding',
          start_date: '2025-01-21',
          end_date: '2025-03-20',
          status: PhaseStatus.OPEN,
        }
      ],
    }
  ];

  // Helper function to calculate progress dynamically based on phases
  const calculateProgress = (phases: Phase[]) => {
    if (!phases || phases.length === 0) return 0;
    const closedCount = phases.filter((p) => p.status === PhaseStatus.CLOSED).length;
    return Math.round((closedCount / phases.length) * 100);
  };

  // Filter Options Extraction
  const projectNames = Array.from(new Set(projects.map(p => p.title)));
  const teamNames = Array.from(new Set(projects.map(p => p.groupName)));
  const teamLeads = Array.from(new Set(
    projects.flatMap(p => p.members.filter(m => m.role === 'Team Lead').map(m => m.name))
  ));

  // Styling Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Filtering Logic
  const filteredProjects = projects.filter((project) => {
    const projectMatch = projectFilter === '' || project.title === projectFilter;
    const teamMatch = teamFilter === '' || project.groupName === teamFilter;

    const leadMatch = leadFilter === '' || project.members.some(
      (m) => m.role === 'Team Lead' && m.name === leadFilter
    );

    return projectMatch && teamMatch && leadMatch;
  });

  const handleStatusChange = (phaseId: number, newStatus: PhaseStatus) => {
    console.log(`Teacher updated Phase ${phaseId} to ${newStatus}`);
    // Add API call here to update the database
  };

  // 4. DETAILED VIEW (Active when a project is clicked)
  if (selectedProject) {
    const progress = calculateProgress(selectedProject.phases);

    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Navigation Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedProject(null)}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Project Details */}
          <div className="w-full">
            <ProjectDashboardView
              projectData={selectedProject}
              userRole={currentUser?.role}
            />
          </div>

          {/* Actions & Live Tracker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-center border border-blue-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                Project Documentation
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Access the automated logbook and project history.
              </p>
              <button
                onClick={() => setIsLogbookOpen(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium"
              >
                Open Smart Logbook
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                Live Progress
              </h3>
              <div className="flex items-end justify-between mb-2">
                <span className="text-4xl font-bold text-blue-600">{progress}%</span>
                <span className="text-sm text-gray-400 pb-1">Completion Status</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <ProjectAnalyticsRAG project={selectedProject} />

          {/* Project Timeline */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 border border-gray-100">
            <div className="flex items-center mb-6 border-b pb-4">
              <ClipboardList className="w-6 h-6 mr-3 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Project Timeline</h3>
                <p className="text-sm text-gray-500">Milestones and phase progress</p>
              </div>
            </div>
            <ProjectTimeline
              phases={selectedProject.phases}
              userRole={currentUser?.role}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>

        {/* Modal-based Logbook */}
        <ChatLogbook
          isOpen={isLogbookOpen}
          onClose={() => setIsLogbookOpen(false)}
          projectData={selectedProject}
          userRole={currentUser?.role}
        />
      </div>
    );
  }

  // 5. MAIN DASHBOARD VIEW (List of all projects)
  return (
    <div className="flex h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Projects</h2>
            <p className="text-gray-600 mt-1">Monitor and manage all student projects</p>
          </div>

          {/* Filters Section */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600">Project Name</label>
                <select
                  value={projectFilter}
                  onChange={(e) => { setProjectFilter(e.target.value); setTeamFilter(''); setLeadFilter(''); }}
                  className="mt-1 w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Projects</option>
                  {projectNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Team Name</label>
                <select
                  value={teamFilter}
                  onChange={(e) => { setTeamFilter(e.target.value); setProjectFilter(''); setLeadFilter(''); }}
                  className="mt-1 w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Teams</option>
                  {teamNames.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              {/* Added Team Lead Filter */}
              <div>
                <label className="text-sm text-gray-600">Team Lead</label>
                <select
                  value={leadFilter}
                  onChange={(e) => { setLeadFilter(e.target.value); setProjectFilter(''); setTeamFilter(''); }}
                  className="mt-1 w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Leads</option>
                  {teamLeads.map(lead => (
                    <option key={lead} value={lead}>{lead}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{projects.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ongoing</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {projects.filter(p => p.status === 'ongoing').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {projects.reduce((acc, p) => acc + p.members.length, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {projects.length > 0
                      ? Math.round(projects.reduce((acc, p) => acc + calculateProgress(p.phases), 0) / projects.length)
                      : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const projectProgress = calculateProgress(project.phases);

              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{project.groupName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{project.members.length} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.expectedEnd).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">{projectProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(projectProgress)}`}
                        style={{ width: `${projectProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
