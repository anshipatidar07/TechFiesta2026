import type { Student, Opportunity, Application, Notification } from "./types"

export const mockStudents2: Student[] = [
  // --- Common Names Case 1: Rahul Verma (Web Developer) ---
  {
    id: "S101",
    name: "Rahul Verma",
    email: "rahul.v.web@university.edu",
    department: "Computer Science",
    year: 3,
    cgpa: 8.4,
    skills: ["React", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS"], // Common: React, Node
    domains: { web: 90, ml: 20, cp: 60, appDev: 40, cyber: 30 },
    projects: [
      {
        id: "P101",
        title: "Task Management Dashboard",
        description: "Kanban board application with drag-and-drop",
        skills: ["React", "Redux", "Firebase"],
        link: "https://github.com/rahulv/taskmaster",
      },
    ],
    experience: [],
    leadership: ["Web Dev Club Secretary"],
  },

  // --- Common Names Case 1: Rahul Verma (The other one - Cybersecurity) ---
  {
    id: "S102",
    name: "Rahul Verma",
    email: "rahul.verma.sec@university.edu",
    department: "Information Technology",
    year: 4,
    cgpa: 7.9,
    skills: ["Python", "Linux", "Bash", "Network Security", "Wireshark"], // Common: Python, Linux
    domains: { web: 30, ml: 10, cp: 50, appDev: 20, cyber: 95 },
    projects: [
      {
        id: "P102",
        title: "Packet Sniffer",
        description: "Network traffic analyzer using raw sockets",
        skills: ["Python", "Networking"],
      },
    ],
    experience: [
      {
        id: "E101",
        title: "Security Intern",
        company: "CyberSafe",
        duration: "2 months",
        description: "Assisted in internal penetration testing",
      },
    ],
    leadership: [],
  },

  // --- Data Science Specialist ---
  {
    id: "S103",
    name: "Meera Iyer",
    email: "meera.iyer@university.edu",
    department: "Data Science",
    year: 3,
    cgpa: 9.1,
    skills: ["Python", "SQL", "Pandas", "Tableau", "Machine Learning"], // Common: Python, SQL
    domains: { web: 20, ml: 85, cp: 50, appDev: 10, cyber: 10 },
    projects: [
      {
        id: "P103",
        title: "Housing Price Predictor",
        description: "Regression analysis on housing datasets",
        skills: ["Python", "Scikit-Learn", "Matplotlib"],
      },
    ],
    experience: [],
    leadership: ["Data Science Guild Member"],
  },

  // --- Common Names Case 2: Ananya Singh (App Dev) ---
  {
    id: "S104",
    name: "Ananya Singh",
    email: "ananya.s.app@university.edu",
    department: "Computer Science",
    year: 2,
    cgpa: 8.7,
    skills: ["Flutter", "Dart", "Firebase", "Android", "Java"], // Common: Java
    domains: { web: 40, ml: 10, cp: 70, appDev: 92, cyber: 10 },
    projects: [
      {
        id: "P104",
        title: "Fitness Tracker",
        description: "Cross-platform mobile app for tracking workouts",
        skills: ["Flutter", "Firebase"],
      },
    ],
    experience: [],
    leadership: [],
  },

  // --- Common Names Case 2: Ananya Singh (Backend/Cloud) ---
  {
    id: "S105",
    name: "Ananya Singh",
    email: "ananya.singh.cloud@university.edu",
    department: "Electronics",
    year: 4,
    cgpa: 8.2,
    skills: ["Java", "Spring Boot", "AWS", "Docker", "PostgreSQL"], // Common: Java, Docker, SQL(Postgres)
    domains: { web: 70, ml: 30, cp: 65, appDev: 40, cyber: 50 },
    projects: [
      {
        id: "P105",
        title: "Microservices Banking API",
        description: "REST API handling transactions",
        skills: ["Java", "Spring Boot", "Docker"],
      },
    ],
    experience: [
      {
        id: "E102",
        title: "Cloud Intern",
        company: "BlueSky Tech",
        duration: "6 months",
        description: "Migrated monoliths to AWS Lambda",
      },
    ],
    leadership: ["IEEE Student Member"],
  },

  // --- Full Stack & ML Hybrid ---
  {
    id: "S106",
    name: "David Chen",
    email: "david.chen@university.edu",
    department: "Computer Science",
    year: 3,
    cgpa: 9.3,
    skills: ["Python", "React", "FastAPI", "TensorFlow", "Docker"], // Common: Python, React, Docker
    domains: { web: 85, ml: 80, cp: 60, appDev: 40, cyber: 35 },
    projects: [
      {
        id: "P106",
        title: "AI Image Generator Web App",
        description: "React frontend connected to Stable Diffusion backend",
        skills: ["React", "FastAPI", "Python"],
      },
    ],
    experience: [],
    leadership: ["Open Source Contributor"],
  },

  // --- DevOps Engineer ---
  {
    id: "S107",
    name: "Sarah Johnson",
    email: "sarah.j@university.edu",
    department: "Information Technology",
    year: 4,
    cgpa: 8.0,
    skills: ["Linux", "Docker", "Kubernetes", "Go", "CI/CD"], // Common: Linux, Docker, Go
    domains: { web: 50, ml: 20, cp: 40, appDev: 20, cyber: 75 },
    projects: [
      {
        id: "P107",
        title: "K8s Cluster Manager",
        description: "CLI tool for managing Kubernetes pods",
        skills: ["Go", "Kubernetes"],
      },
    ],
    experience: [],
    leadership: [],
  },

  // --- Competitive Programmer ---
  {
    id: "S108",
    name: "Kevin White",
    email: "kevin.white@university.edu",
    department: "Computer Science",
    year: 2,
    cgpa: 9.6,
    skills: ["C++", "Java", "Python", "Algorithms", "Data Structures"], // Common: Java, Python, C++
    domains: { web: 20, ml: 40, cp: 98, appDev: 10, cyber: 20 },
    projects: [
      {
        id: "P108",
        title: "Pathfinder",
        description: "Visualizer for A* and Dijkstra algorithms",
        skills: ["C++", "SFML"],
      },
    ],
    experience: [],
    leadership: ["CodeChef College Chapter Lead"],
  },

  // --- IoT Specialist ---
  {
    id: "S109",
    name: "Priya Desai",
    email: "priya.desai@university.edu",
    department: "Electronics",
    year: 3,
    cgpa: 7.5,
    skills: ["C", "C++", "Arduino", "Python", "IoT"], // Common: C++, Python
    domains: { web: 20, ml: 30, cp: 50, appDev: 30, cyber: 50 },
    projects: [
      {
        id: "P109",
        title: "Smart Irrigation System",
        description: "Automated watering using soil moisture sensors",
        skills: ["Arduino", "C++"],
      },
    ],
    experience: [],
    leadership: [],
  },

  // --- Frontend Designer ---
  {
    id: "S110",
    name: "Tom Holland",
    email: "tom.holland@university.edu",
    department: "Design",
    year: 2,
    cgpa: 8.8,
    skills: ["Figma", "React", "CSS", "JavaScript", "Adobe XD"], // Common: React, JS
    domains: { web: 95, ml: 0, cp: 20, appDev: 60, cyber: 0 },
    projects: [
      {
        id: "P110",
        title: "University Portal Redesign",
        description: "Modern UI concept for the student portal",
        skills: ["Figma", "React"],
      },
    ],
    experience: [],
    leadership: ["Design Team Lead"],
  },
];