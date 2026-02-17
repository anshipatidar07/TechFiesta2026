import type { Student, Opportunity, Application, Notification } from "./types"

export const mockStudents: Student[] = [
  // --- Original Students (S001 - S004) ---
  {
    id: "S001",
    name: "Alex Kumar",
    email: "alex.kumar@university.edu",
    department: "Computer Science",
    year: 3,
    cgpa: 8.5,
    skills: ["React", "Node.js", "Python", "MongoDB", "TypeScript", "Docker"],
    domains: { web: 85, ml: 60, cp: 70, appDev: 75, cyber: 50 },
    projects: [
      {
        id: "P001",
        title: "E-commerce Platform",
        description: "Full-stack e-commerce with payment integration",
        skills: ["React", "Node.js", "MongoDB"],
        link: "https://github.com/alex/ecommerce",
      },
    ],
    experience: [
      {
        id: "E001",
        title: "Frontend Intern",
        company: "TechCorp",
        duration: "3 months",
        description: "Built responsive web applications using React",
      },
    ],
    leadership: ["Technical Lead - College Fest", "President - Coding Club"],
  },
  {
    id: "S002",
    name: "Priya Sharma",
    email: "priya.sharma@university.edu",
    department: "Computer Science",
    year: 4,
    cgpa: 9.2,
    skills: ["Python", "TensorFlow", "Machine Learning", "Data Science", "R", "SQL"],
    domains: { web: 50, ml: 95, cp: 80, appDev: 40, cyber: 55 },
    projects: [
      {
        id: "P002",
        title: "Image Classification System",
        description: "CNN-based image classification with 94% accuracy",
        skills: ["Python", "TensorFlow", "Keras"],
      },
    ],
    experience: [],
    leadership: ["Research Assistant - AI Lab"],
  },
  {
    id: "S003",
    name: "Rahul Verma",
    email: "rahul.verma@university.edu",
    department: "Information Technology",
    year: 2,
    cgpa: 8.0,
    skills: ["Java", "Spring Boot", "MySQL", "Kotlin", "Android"],
    domains: { web: 60, ml: 30, cp: 85, appDev: 90, cyber: 45 },
    projects: [
      {
        id: "P003",
        title: "Food Delivery App",
        description: "Android app with real-time order tracking",
        skills: ["Kotlin", "Android", "Firebase"],
      },
    ],
    experience: [],
    leadership: [],
  },
  {
    id: "S004",  
    name: "Sneha Patel",
    email: "sneha.patel@university.edu",
    department: "Computer Science",
    year: 3,
    cgpa: 8.8,
    skills: ["Cybersecurity", "Penetration Testing", "Python", "Linux", "Network Security"],
    domains: { web: 55, ml: 40, cp: 65, appDev: 50, cyber: 92 },
    projects: [
      {
        id: "P004",
        title: "Vulnerability Scanner",
        description: "Automated security scanning tool",
        skills: ["Python", "Nmap", "Security"],
      },
    ],
    experience: [],
    leadership: ["Cybersecurity Club - Vice President"],
  },

  // --- New Students (S005 - S014) ---

  // 5. Backend & Cloud Specialist
  {
    id: "S005",
    name: "Vikram Singh",
    email: "vikram.singh@university.edu",
    department: "Computer Science",
    year: 4,
    cgpa: 8.9,
    skills: ["Go", "Microservices", "Docker", "Kubernetes", "AWS", "PostgreSQL"],
    domains: { web: 80, ml: 40, cp: 75, appDev: 60, cyber: 65 },
    projects: [
      {
        id: "P005",
        title: "Scalable Chat Service",
        description: "High-concurrency chat backend handling 10k connections",
        skills: ["Go", "WebSocket", "Redis"],
      },
    ],
    experience: [
      {
        id: "E002",
        title: "Backend Intern",
        company: "CloudScale Solutions",
        duration: "6 months",
        description: "Optimized API latency by 40%",
      },
    ],
    leadership: ["Cloud Computing Lead"],
  },

  // 6. AI Agents & LLM Engineer
  {
    id: "S006",
    name: "Ananya Gupta",
    email: "ananya.gupta@university.edu",
    department: "Artificial Intelligence",
    year: 3,
    cgpa: 9.5,
    skills: ["LangChain", "OpenAI API", "Python", "Vector Databases", "FastAPI"],
    domains: { web: 70, ml: 98, cp: 60, appDev: 50, cyber: 40 },
    projects: [
      {
        id: "P006",
        title: "Legal Document Assistant",
        description: "RAG-based AI agent to summarize legal PDFs",
        skills: ["LangChain", "Pinecone", "Next.js"],
      },
    ],
    experience: [],
    leadership: ["Hackathon Winner - GenAI Hack"],
  },

  // 7. Blockchain & Web3 Developer
  {
    id: "S007",
    name: "Arjun Mehta",
    email: "arjun.mehta@university.edu",
    department: "Computer Science",
    year: 3,
    cgpa: 8.3,
    skills: ["Solidity", "Ethereum", "Web3.js", "React", "Rust"],
    domains: { web: 85, ml: 30, cp: 65, appDev: 40, cyber: 75 },
    projects: [
      {
        id: "P007",
        title: "Decentralized Voting System",
        description: "Secure voting platform on Ethereum testnet",
        skills: ["Solidity", "Hardhat", "React"],
      },
    ],
    experience: [],
    leadership: ["Blockchain Society Member"],
  },

  // 8. Competitive Programmer (Algorithm Specialist)
  {
    id: "S008",
    name: "David John",
    email: "david.john@university.edu",
    department: "Mathematics & Computing",
    year: 2,
    cgpa: 9.8,
    skills: ["C++", "Algorithms", "Data Structures", "Python", "Math"],
    domains: { web: 30, ml: 50, cp: 99, appDev: 20, cyber: 30 },
    projects: [
      {
        id: "P008",
        title: "AlgoVisualizer",
        description: "Tool to visualize graph algorithms like Dijkstra",
        skills: ["C++", "Qt Framework"],
      },
    ],
    experience: [],
    leadership: ["ICPC Regionalist"],
  },

  // 9. DevOps & SRE
  {
    id: "S009",
    name: "Rohan Das",
    email: "rohan.das@university.edu",
    department: "Information Technology",
    year: 4,
    cgpa: 7.9,
    skills: ["Linux", "Bash", "Terraform", "Jenkins", "Ansible", "Azure"],
    domains: { web: 60, ml: 20, cp: 50, appDev: 30, cyber: 80 },
    projects: [
      {
        id: "P009",
        title: "Auto-Scaling Infrastructure",
        description: "Infrastructure as Code for a 3-tier architecture",
        skills: ["Terraform", "AWS", "Nginx"],
      },
    ],
    experience: [
      {
        id: "E003",
        title: "DevOps Trainee",
        company: "StartUp Hub",
        duration: "3 months",
        description: "Automated CI/CD pipelines",
      },
    ],
    leadership: [],
  },

  // 10. Game Developer
  {
    id: "S010",
    name: "Karthik N",
    email: "karthik.n@university.edu",
    department: "Computer Science",
    year: 3,
    cgpa: 8.1,
    skills: ["Unity", "C#", "Blender", "Game Physics", "HLSL"],
    domains: { web: 40, ml: 30, cp: 70, appDev: 95, cyber: 20 },
    projects: [
      {
        id: "P010",
        title: "Space Survivor",
        description: "3D Endless runner game for mobile",
        skills: ["Unity", "C#"],
      },
    ],
    experience: [],
    leadership: ["Game Dev Club Head"],
  },

  // 11. Data Engineer
  {
    id: "S011",
    name: "Sara Khan",
    email: "sara.khan@university.edu",
    department: "Data Science",
    year: 4,
    cgpa: 9.0,
    skills: ["Apache Spark", "Hadoop", "SQL", "Scala", "ETL Pipelines"],
    domains: { web: 40, ml: 85, cp: 60, appDev: 30, cyber: 40 },
    projects: [
      {
        id: "P011",
        title: "Real-time Traffic Analysis",
        description: "Streaming data pipeline for traffic sensors",
        skills: ["Kafka", "Spark", "Python"],
      },
    ],
    experience: [
      {
        id: "E004",
        title: "Data Analyst Intern",
        company: "FinTech Corp",
        duration: "4 months",
        description: "Analyzed transaction datasets using SQL",
      },
    ],
    leadership: [],
  },

  // 12. iOS Developer (Mobile)
  {
    id: "S012",
    name: "Emily Fernandez",
    email: "emily.fernandez@university.edu",
    department: "Computer Science",
    year: 3,
    cgpa: 8.6,
    skills: ["Swift", "iOS", "SwiftUI", "CoreData", "XCode"],
    domains: { web: 50, ml: 20, cp: 60, appDev: 98, cyber: 45 },
    projects: [
      {
        id: "P012",
        title: "Budget Tracker iOS",
        description: "Personal finance app with widget support",
        skills: ["Swift", "SwiftUI"],
      },
    ],
    experience: [],
    leadership: ["App Development Mentor"],
  },

  // 13. UI/UX & Frontend Specialist
  {
    id: "S013",
    name: "Neha Joshi",
    email: "neha.joshi@university.edu",
    department: "Design & Technology",
    year: 2,
    cgpa: 8.7,
    skills: ["Figma", "Adobe XD", "Vue.js", "Tailwind CSS", "Three.js"],
    domains: { web: 95, ml: 10, cp: 40, appDev: 70, cyber: 20 },
    projects: [
      {
        id: "P013",
        title: "3D Portfolio Site",
        description: "Interactive portfolio using Three.js",
        skills: ["Vue.js", "Three.js", "GSAP"],
      },
    ],
    experience: [],
    leadership: ["Design Lead - Creative Society"],
  },

  // 14. IoT & Embedded Systems
  {
    id: "S014",
    name: "Varun Rao",
    email: "varun.rao@university.edu",
    department: "Electronics & Communication",
    year: 4,
    cgpa: 7.8,
    skills: ["C", "C++", "Arduino", "Raspberry Pi", "MQTT", "PCB Design"],
    domains: { web: 30, ml: 40, cp: 60, appDev: 50, cyber: 60 },
    projects: [
      {
        id: "P014",
        title: "Smart Home Hub",
        description: "IoT system for home automation via voice",
        skills: ["C++", "MQTT", "Python"],
      },
    ],
    experience: [],
    leadership: ["Robotics Club President"],
  },
];

export const mockOpportunities: Opportunity[] = [
  {
    id: "OP001",
    title: "Full Stack Developer Intern",
    company: "TechVista Solutions",
    type: "internship",
    description:
      "Work on cutting-edge web applications using React and Node.js. Build scalable microservices and contribute to our product roadmap.",
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "AWS"],
    tags: ["Remote", "Paid", "Product-based", "Fintech"],
    stipend: "₹30,000/month",
    duration: "6 months",
    eligibility: {
      minCGPA: 7.5,
      departments: ["Computer Science", "Information Technology"],
      years: [3, 4],
    },
    postedBy: "TnP Office",
    postedDate: "2025-01-15",
    deadline: "2025-02-28",
    applicants: 45,
  },
  {
    id: "OP002",
    title: "ML Research Intern",
    company: "DataMind AI",
    type: "internship",
    description:
      "Join our research team to work on computer vision and NLP projects. Experience with deep learning frameworks required.",
    skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning"],
    tags: ["On-site", "Bangalore", "Research", "AI/ML"],
    stipend: "₹40,000/month",
    duration: "3-6 months",
    eligibility: {
      minCGPA: 8.0,
      departments: ["Computer Science", "Data Science"],
      years: [3, 4],
    },
    postedBy: "Prof. Mehta",
    postedDate: "2025-01-20",
    deadline: "2025-03-10",
    applicants: 32,
  },
  {
    id: "OP003",
    title: "Android Developer Position",
    company: "MobileFirst Inc",
    type: "internship",
    description:
      "Build innovative mobile applications for millions of users. Work with modern Android architecture and best practices.",
    skills: ["Kotlin", "Android", "MVVM", "Jetpack Compose", "Firebase"],
    tags: ["Hybrid", "Paid", "Consumer App"],
    stipend: "₹25,000/month",
    duration: "4 months",
    eligibility: {
      minCGPA: 7.0,
      departments: ["Computer Science", "Information Technology", "Electronics"],
      years: [2, 3, 4],
    },
    postedBy: "TnP Office",
    postedDate: "2025-01-18",
    deadline: "2025-02-25",
    applicants: 28,
  },
  {
    id: "OP004",
    title: "Cybersecurity Analyst Intern",
    company: "SecureNet Systems",
    type: "internship",
    description: "Work on penetration testing, vulnerability assessment, and security audits for enterprise clients.",
    skills: ["Cybersecurity", "Python", "Linux", "Network Security", "Ethical Hacking"],
    tags: ["On-site", "Security", "Enterprise"],
    stipend: "₹35,000/month",
    duration: "5 months",
    eligibility: {
      minCGPA: 7.5,
      departments: ["Computer Science", "Cybersecurity"],
      years: [3, 4],
    },
    postedBy: "Dr. Singh",
    postedDate: "2025-01-22",
    deadline: "2025-03-05",
    applicants: 18,
  },
  {
    id: "OP005",
    title: "Academic Project: Campus Management System",
    company: "University Computer Lab",
    type: "project",
    description:
      "Build a comprehensive campus management system with student portal, faculty dashboard, and admin controls.",
    skills: ["React", "Node.js", "PostgreSQL", "REST API"],
    tags: ["Academic", "Team Project", "Semester Long"],
    eligibility: {
      departments: ["Computer Science", "Information Technology"],
      years: [2, 3],
    },
    postedBy: "Prof. Kumar",
    postedDate: "2025-01-10",
    deadline: "2025-02-15",
    applicants: 12,
  },
]

export const mockApplications: Application[] = [
  {
    id: "APP001",
    opportunityId: "OP001",
    studentId: "S001",
    stage: "interview",
    matchScore: 88,
    appliedDate: "2025-01-20",
    lastUpdated: "2025-01-28",
  },
  {
    id: "APP002",
    opportunityId: "OP002",
    studentId: "S002",
    stage: "test",
    matchScore: 95,
    appliedDate: "2025-01-22",
    lastUpdated: "2025-01-26",
  },
  {
    id: "APP003",
    opportunityId: "OP003",
    studentId: "S003",
    stage: "screening",
    matchScore: 82,
    appliedDate: "2025-01-25",
    lastUpdated: "2025-01-27",
  },
]

export const mockNotifications: Notification[] = [
  {
    id: "N001",
    title: "Application Status Update",
    message: "Your application for Full Stack Developer Intern has been shortlisted!",
    type: "success",
    read: false,
    timestamp: "2025-01-28T10:30:00",
  },
  {
    id: "N002",
    title: "New Opportunity",
    message: "New ML Research Intern position posted by DataMind AI",
    type: "info",
    read: false,
    timestamp: "2025-01-27T15:45:00",
  },
  {
    id: "N003",
    title: "Deadline Reminder",
    message: "Application deadline for Android Developer Position is in 3 days",
    type: "warning",
    read: true,
    timestamp: "2025-01-26T09:00:00",
  },
  {
    id: "N004",
    title: "Resume Update",
    message: "Please update your resume with recent projects",
    type: "info",
    read: true,
    timestamp: "2025-01-25T14:20:00",
  },
]

// Utility function to calculate match score between skills
export function calculateMatchScore(studentSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 0

  const matchedSkills = studentSkills.filter((skill) =>
    requiredSkills.some(
      (req) => skill.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(skill.toLowerCase()),
    ),
  )

  const baseScore = (matchedSkills.length / requiredSkills.length) * 100
  const bonusScore = Math.min((studentSkills.length - matchedSkills.length) * 2, 20)

  return Math.min(Math.round(baseScore + bonusScore), 100)
}

// Extract skills from resume text (mock implementation)
export function extractSkillsFromResume(resumeText: string): string[] {
  const commonSkills = [
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Express",
    "Python",
    "Django",
    "Flask",
    "Java",
    "Spring",
    "Kotlin",
    "Swift",
    "Flutter",
    "React Native",
    "Android",
    "iOS",
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "Keras",
    "Data Science",
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Git",
    "CI/CD",
    "TypeScript",
    "JavaScript",
    "HTML",
    "CSS",
    "Tailwind",
    "Bootstrap",
    "REST API",
    "GraphQL",
    "Microservices",
    "Cybersecurity",
    "Penetration Testing",
    "Linux",
    "Network Security",
    "Blockchain",
  ]

  return commonSkills.filter((skill) => resumeText.toLowerCase().includes(skill.toLowerCase()))
}

// Generate team recommendations based on complementary skills
export function generateTeamRecommendations(currentStudent: Student, allStudents: Student[]): any[] {
  return allStudents
    .filter((s) => s.id !== currentStudent.id)
    .map((student) => {
      // Calculate complementary score based on different domains
      let complementaryScore = 0
      Object.keys(currentStudent.domains).forEach((domain) => {
        const key = domain as keyof typeof currentStudent.domains
        const diff = Math.abs(currentStudent.domains[key] - student.domains[key])
        if (diff > 20) complementaryScore += diff / 2
      })

      // Add bonus for different skill sets
      const uniqueSkills = student.skills.filter((skill) => !currentStudent.skills.includes(skill))
      complementaryScore += uniqueSkills.length * 5

      return {
        id: student.id,
        name: student.name,
        skills: student.skills,
        domains: student.domains,
        matchScore: Math.min(Math.round(complementaryScore), 100),
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    
}

