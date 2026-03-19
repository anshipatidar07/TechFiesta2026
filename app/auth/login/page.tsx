"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useState, Suspense } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ApiError, loginUser } from "@/lib/auth"
import { Mail, Lock, GraduationCap, Presentation, Building2, Briefcase, Eye, EyeOff } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  // Added state to track the selected role for the UI
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "tnp" | "recruiter">("student")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const showRegisteredMessage = searchParams.get("registered") === "1"
  const nextPath = searchParams.get("next")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await loginUser({
        identifier: identifier.trim(),
        password,
        // If your backend eventually needs the role, you can pass it here like:
        // role: selectedRole
      })

      const roleDashboardMap: Record<string, string> = {
        student: "/dashboard/student",
        teacher: "/dashboard/teacher",
        tnp: "/dashboard/tnp",
        recruiter: "/dashboard/recruiter",
      }

      const rolePath = response.user.role ? roleDashboardMap[response.user.role] : undefined
      const fallbackPath = rolePath ?? "/dashboard/student"
      const redirectPath = nextPath && nextPath.startsWith("/") ? nextPath : fallbackPath
      router.push(redirectPath)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Login failed. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f0fe] via-[#f4f7fb] to-[#e8f0fe] flex justify-center">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 min-h-screen">
        
        {/* Left Section - Hero Area */}
        <div className="hidden lg:flex flex-col justify-center p-12 xl:p-24 relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[18px] border-b-blue-600 transform -rotate-90"></div>
            <span className="text-2xl font-bold tracking-widest text-[#1e3a8a]">KATANA</span>
          </div>
          
          <div className="mb-6">
            <span className="bg-blue-200/50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
              <span className="text-blue-600 mr-2">•</span> UNIFIED CAMPUS PORTAL
            </span>
          </div>
          
          <h1 className="text-[4rem] font-extrabold text-[#1a202c] leading-[1.1] mb-6 tracking-tight">
            Your career <br /> starts <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">here.</span>
          </h1>
          
          <p className="text-slate-500 text-base mb-14 max-w-md leading-relaxed">
            Katana connects students, faculty, and recruiters on a single platform — streamlining internship discovery, project collaboration, and placement tracking.
          </p>
          
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl shadow-blue-900/5 flex gap-8 w-fit border border-white">
            <div className="text-center px-2">
              <div className="text-2xl font-bold text-[#1e3a8a]">2.4k+</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Students</div>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div className="text-center px-2">
              <div className="text-2xl font-bold text-[#1e3a8a]">180+</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Companies</div>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div className="text-center px-2">
              <div className="text-2xl font-bold text-[#1e3a8a]">94%</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Placement</div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="flex items-center justify-center p-6 w-full">
          <Card className="w-full max-w-[460px] border-0 shadow-2xl shadow-blue-900/10 rounded-[2rem] p-4 sm:p-8 bg-white/95 backdrop-blur-sm">
            <CardHeader className="px-0 pt-0 pb-8">
              <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-slate-500 text-sm mt-2">
                Select your role and sign in to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {showRegisteredMessage ? (
                <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                  <AlertTitle>Registration successful</AlertTitle>
                  <AlertDescription>Your account was created. Verify and Sign in.</AlertDescription>
                </Alert>
              ) : null}

              {/* Interactive Role Selection */}
              <div className="mb-8">
                <p className="text-[10px] font-bold text-slate-400 mb-3 tracking-widest uppercase">I am a —</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedRole("student")}
                    className={`justify-start gap-2 h-11 rounded-xl transition-colors ${
                      selectedRole === "student" 
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 hover:bg-blue-50" 
                        : "text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <GraduationCap className="h-4 w-4" /> Student
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedRole("teacher")}
                    className={`justify-start gap-2 h-11 rounded-xl transition-colors ${
                      selectedRole === "teacher" 
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 hover:bg-blue-50" 
                        : "text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Presentation className="h-4 w-4" /> Teacher
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedRole("tnp")}
                    className={`justify-start gap-2 h-11 rounded-xl transition-colors ${
                      selectedRole === "tnp" 
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 hover:bg-blue-50" 
                        : "text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Building2 className="h-4 w-4" /> TNP Officer
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedRole("recruiter")}
                    className={`justify-start gap-2 h-11 rounded-xl transition-colors ${
                      selectedRole === "recruiter" 
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 hover:bg-blue-50" 
                        : "text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Briefcase className="h-4 w-4" /> Recruiter
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="identifier" className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">
                    Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="identifier"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="Enter your email"
                      required
                      className="pl-10 bg-slate-50/50 border-slate-200 h-12 rounded-xl text-sm focus-visible:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                      Password
                    </label>
                    <Link href="#" className="text-xs text-blue-600 font-medium hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      required
                      className="pl-10 pr-10 bg-slate-50/50 border-slate-200 h-12 rounded-xl text-sm focus-visible:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1 pb-2">
                  <input 
                    type="checkbox" 
                    id="keep-signed-in" 
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
                  />
                  <label htmlFor="keep-signed-in" className="text-sm text-slate-500 font-medium cursor-pointer">
                    Keep me signed in
                  </label>
                </div>

                {error ? (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertTitle>Login failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-sm font-semibold bg-[#2e5bb3] hover:bg-blue-800 text-white rounded-xl shadow-md transition-all" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "SIGN IN →"}
                </Button>
              </form>

              <div className="mt-10 pt-6 border-t border-slate-100 text-center relative">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-4 text-[10px] font-bold text-slate-300 tracking-widest uppercase">
                  New to Katana?
                </span>
                <p className="text-sm text-slate-500 mt-2">
                  Don't have an account?{" "}
                  <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">
                    Create one
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#e8f0fe] via-[#f4f7fb] to-[#e8f0fe] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}