"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState, Suspense } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type ConfirmState = "idle" | "loading" | "success" | "error"

interface ConfirmResponse {
  message?: string
  error?: string
  student?: string
  company?: string
  already_confirmed?: boolean
}

function EmailActionContent() {
  const searchParams = useSearchParams()
  const hasStarted = useRef(false)
  const [state, setState] = useState<ConfirmState>("idle")
  const [message, setMessage] = useState("Preparing confirmation...")
  const [company, setCompany] = useState<string | null>(null)

  useEffect(() => {
    if (hasStarted.current) {
      return
    }

    hasStarted.current = true

    const error = searchParams.get("error")
    const token = searchParams.get("token")

    if (error === "missing_token" || !token) {
      setState("error")
      setMessage("This confirmation link is invalid or incomplete.")
      return
    }

    const run = async () => {
      setState("loading")
      setMessage("Confirming your interest...")

      try {
        const apiBaseUrl = "/api"; // process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000"
        const response = await fetch(
          `${apiBaseUrl}/drives/confirm-interest?token=${encodeURIComponent(token)}`,
          { method: "GET", credentials: "include" },
        )

        const payload = (await response.json().catch(() => null)) as ConfirmResponse | null

        if (!response.ok) {
          setMessage(payload?.error ?? "Could not confirm your interest. Please try again.")
          setState("error")
          return
        }

        setCompany(payload?.company ?? null)
        setMessage(payload?.message ?? "Your interest has been confirmed.")
        setState("success")
      } catch {
        setMessage("Unable to reach the server right now. Please try again shortly.")
        setState("error")
      }
    }

    void run()
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Drive Confirmation</CardTitle>
          <CardDescription>We are processing your confirmation request.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {state === "loading" || state === "idle" ? (
            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <Spinner className="size-4" />
                Processing
              </AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          {state === "success" ? (
            <Alert>
              <AlertTitle>Confirmation complete</AlertTitle>
              <AlertDescription>
                {message}
                {company ? ` for ${company}.` : ""}
              </AlertDescription>
            </Alert>
          ) : null}

          {state === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>Confirmation failed</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex gap-2">
            <Button asChild className="flex-1" variant={state === "error" ? "outline" : "default"}>
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function EmailActionPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Drive Confirmation</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <EmailActionContent />
    </Suspense>
  )
}
