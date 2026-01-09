import * as pdfjsLib from "pdfjs-dist"
import mammoth from "mammoth"

// IMPORTANT: Set the worker source for PDF.js to a CDN for client-side usage 
// to avoid complex Webpack configuration in Next.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

// A basic list of skills to look for (expand this list as needed)
const SKILL_DATABASE = [
  "React", "Next.js", "Node.js", "TypeScript", "JavaScript", "Python", 
  "Java", "C++", "C#", "SQL", "NoSQL", "MongoDB", "PostgreSQL", 
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Git", 
  "CI/CD", "Machine Learning", "Data Analysis", "Communication", 
  "Problem Solving", "Teamwork", "Agile", "Scrum", "HTML", "CSS", 
  "Tailwind", "Redux", "GraphQL", "REST API"
]

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type

  if (fileType === "application/pdf") {
    return await parsePDF(file)
  } else if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await parseDocx(file)
  } else if (fileType === "text/plain") {
    return await file.text()
  } else {
    throw new Error("Unsupported file format")
  }
}

const parsePDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise
  let fullText = ""

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item: any) => item.str).join(" ")
    fullText += pageText + "\n"
  }

  return fullText
}

const parseDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

export const analyzeSkills = (text: string): string[] => {
  const lowerCaseText = text.toLowerCase()
  // Filter the database to find skills present in the text
  // Using word boundary regex \b to avoid partial matches (e.g., "Java" inside "JavaScript")
  return SKILL_DATABASE.filter((skill) => {
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special chars for regex
    const regex = new RegExp(`\\b${escapedSkill.toLowerCase()}\\b`)
    return regex.test(lowerCaseText)
  })
}