"use client"

export interface AuthUser {
  id: string
  username: string
  email: string
  is_verified: boolean
  role?: "student" | "teacher" | "tnp" | "recruiter"
}

export interface TokenPair {
  access_token: string
  refresh_token: string
}

interface RegisterResponse {
  message: string
  preview_link?: string
  user: AuthUser
}

interface LoginResponse extends TokenPair {
  message?: string
  user: AuthUser
}

interface VerifyResponse extends TokenPair {
  message: string
  user: AuthUser
}

interface VerifyInviteResponse extends TokenPair {
  message: string
  user: AuthUser
}

interface RefreshResponse extends TokenPair {
  message: string
}

interface RequestMagicLinkResponse {
  message: string
  preview_link?: string
}

interface MeResponse {
  user: AuthUser
}

interface SendInvitesResponse {
  message: string
  sent: number
  failed: number
  results?: Array<{ email: string; status: string; reason?: string | null }>
}

const ACCESS_TOKEN_KEY = "auth_access_token"
const REFRESH_TOKEN_KEY = "auth_refresh_token"

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

function apiBaseUrl() {
  return "/api"; //process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000"
}

function isBrowser() {
  return typeof window !== "undefined"
}

async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

async function parseApiError(response: Response): Promise<ApiError> {
  const payload = await safeJson<{
    message?: string
    error?: string
    errors?: Array<{ message?: string } | string>
  }>(response)

  const list = payload?.errors
  const firstListError = Array.isArray(list)
    ? typeof list[0] === "string"
      ? list[0]
      : list[0]?.message
    : undefined

  const message = payload?.message ?? payload?.error ?? firstListError ?? "Request failed"
  return new ApiError(message, response.status)
}

export function setAuthTokens(_tokens: TokenPair) {
  return
}

export function clearAuthTokens() {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getAccessToken() {
  return null
}

export function getRefreshToken() {
  return null
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
  })

  if (!response.ok) {
    throw await parseApiError(response)
  }

  const payload = await safeJson<T>(response)
  if (!payload) {
    throw new ApiError("Invalid server response", response.status)
  }

  return payload
}

export async function registerUser(input: {
  username: string
  email: string
  password: string
}) {
  return request<RegisterResponse>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
}

export async function requestMagicLink(identifier: string) {
  return request<RequestMagicLinkResponse>("/auth/magic-link/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  })
}

export async function verifyMagicLink(token: string) {
  return request<VerifyResponse>("/auth/magic-link/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
}

export async function verifyInviteMagicLink(token: string) {
  return request<VerifyInviteResponse>("/auth/invite-magic/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
}

export async function loginUser(input: { identifier: string; password: string }) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
}

export async function refreshToken(refreshTokenValue: string) {
  const refreshed = await request<RefreshResponse>("/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  })

  return refreshed
}

export async function logoutUser(_refreshTokenValue: string | null) {
  try {
    await request<{ message: string }>("/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
  } finally {
    clearAuthTokens()
  }
}

export async function authFetch(path: string, init: RequestInit = {}) {
  const makeRequest = async () =>
    fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      credentials: "include",
    })

  const response = await makeRequest()

  if (response.status !== 401 || path === "/auth/refresh") {
    return response
  }

  try {
    const refreshResponse = await fetch(`${apiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      credentials: "include",
    })

    if (!refreshResponse.ok) {
      clearAuthTokens()
      return response
    }

    return await makeRequest()
  } catch {
    clearAuthTokens()
    return response
  }
}

export async function getCurrentUser() {
  const response = await authFetch("/auth/me", {
    method: "GET",
  })

  if (!response.ok) {
    throw await parseApiError(response)
  }

  const payload = await safeJson<MeResponse>(response)
  if (!payload) {
    throw new ApiError("Invalid server response", response.status)
  }

  return payload
}

export async function sendInviteMagicLinks(input: {
  emails: string[]
  custom_message?: string
  expires_at: string
}) {
  const response = await authFetch("/invites/magic/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw await parseApiError(response)
  }

  const payload = await safeJson<SendInvitesResponse>(response)
  if (!payload) {
    throw new ApiError("Invalid server response", response.status)
  }

  return payload
}
