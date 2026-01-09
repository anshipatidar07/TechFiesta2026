"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, XMarkIcon, DocumentArrowUpIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import { extractTextFromFile, analyzeSkills } from "@/lib/documentParser" // Import our utility

export default function PostOpportunityPage() {
  const router = useRouter()
  const { addOpportunity } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isParsing, setIsParsing] = useState(false)
  const [fileName, setFileName] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    type: "internship" as "internship" | "project" | "fulltime",
    description: "",
    stipend: "",
    duration: "",
    minCGPA: "",
    departments: [] as string[],
    years: [] as number[],
  })

  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  // --- File Upload & Parsing Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsParsing(true)

    try {
      // 1. Extract Text
      const extractedText = await extractTextFromFile(file)
      
      // 2. Analyze Skills
      const foundSkills = analyzeSkills(extractedText)

      // 3. Update State
      setFormData((prev) => ({ ...prev, description: extractedText }))
      
      // Merge found skills with existing ones, avoiding duplicates
      setSkills((prev) => Array.from(new Set([...prev, ...foundSkills])))

      useAppStore.getState().addNotification({
        id: `N${Date.now()}`,
        title: "Document Parsed",
        message: `Extracted ${foundSkills.length} skills from ${file.name}`,
        type: "success",
        read: false,
        timestamp: new Date().toISOString(),
      })

    } catch (error) {
      console.error("Parsing error:", error)
      useAppStore.getState().addNotification({
        id: `ERR${Date.now()}`,
        title: "Parsing Failed",
        message: "Could not read the document. Please try a text, pdf, or docx file.",
        type: "error",
        read: false,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsParsing(false)
    }
  }

  // --- Existing Helper Functions ---

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newOpportunity = {
      id: `OP${Date.now()}`,
      title: formData.title,
      company: formData.company,
      type: formData.type,
      description: formData.description,
      skills,
      tags,
      stipend: formData.stipend || undefined,
      duration: formData.duration || undefined,
      eligibility: {
        minCGPA: formData.minCGPA ? Number.parseFloat(formData.minCGPA) : undefined,
        departments: formData.departments.length > 0 ? formData.departments : undefined,
        years: formData.years.length > 0 ? formData.years : undefined,
      },
      postedBy: "Current User",
      postedDate: new Date().toISOString().split("T")[0],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      applicants: 0,
    }

    addOpportunity(newOpportunity)

    useAppStore.getState().addNotification({
      id: `N${Date.now()}`,
      title: "Opportunity Posted",
      message: `${formData.title} has been posted successfully!`,
      type: "success",
      read: false,
      timestamp: new Date().toISOString(),
    })

    router.push("/opportunities")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Post New Opportunity</h1>
        <p className="mt-1 text-muted-foreground">Upload a Job Description (JD) to auto-fill details</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass rounded-2xl p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                required
                placeholder="e.g., Full Stack Developer Intern"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="company">Company/Organization *</Label>
              <Input
                id="company"
                required
                placeholder="e.g., TechCorp Solutions"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="type">Opportunity Type *</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="project">Academic Project</SelectItem>
                  <SelectItem value="fulltime">Full-time Position</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Document Upload & Description Section */}
            <div className="space-y-3">
              <Label>Description / Job Document *</Label>
              
              {/* File Input Zone */}
              <div 
                className="border-2 border-dashed border-input rounded-xl p-6 flex flex-col items-center justify-center bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                />
                
                {isParsing ? (
                  <div className="flex flex-col items-center animate-pulse">
                    <DocumentTextIcon className="h-10 w-10 text-primary mb-2" />
                    <p className="text-sm font-medium">Analyzing document...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <DocumentArrowUpIcon className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      {fileName ? fileName : "Upload Job Description (PDF, DOCX, TXT)"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fileName ? "Click to change file" : "We'll extract the skills automatically"}
                    </p>
                  </div>
                )}
              </div>

              {/* Parsed Text Area (Editable) */}
              <div className="relative">
                <Label htmlFor="description" className="text-xs text-muted-foreground mb-1 block">
                  Parsed Description (You can edit this)
                </Label>
                <Textarea
                  id="description"
                  required
                  rows={6}
                  placeholder="Or type description manually..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
          </div>

          {/* Skills Section - Auto-populated but editable */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">Required Skills</h2>
              {skills.length > 0 && (
                <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  Auto-detected {skills.length} skills
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add a skill manually (e.g., React)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill}>
                <PlusIcon className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Upload a document to auto-detect skills or add them manually.
                </p>
              )}
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-sm font-medium text-primary"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Tags</h2>

            <div className="flex gap-2">
              <Input
                placeholder="Add a tag (e.g., Remote, Paid)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                <PlusIcon className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Additional Details & Eligibility (Unchanged) */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="stipend">Stipend/Salary</Label>
              <Input
                id="stipend"
                placeholder="e.g., ₹30,000/month"
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 3-6 months"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Eligibility Criteria</h2>
            <div>
              <Label htmlFor="minCGPA">Minimum CGPA</Label>
              <Input
                id="minCGPA"
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="e.g., 7.5"
                value={formData.minCGPA}
                onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isParsing}>
              {isParsing ? "Processing File..." : "Post Opportunity"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}