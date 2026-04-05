const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string) {
  localStorage.setItem('token', token)
}

export function clearToken() {
  localStorage.removeItem('token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `HTTP ${res.status}`)
  }

  return res.json()
}

// Auth
export interface UserInfo {
  id: number
  email: string
  display_name: string
  is_admin: boolean
}

interface TokenResponse {
  access_token: string
  token_type: string
  user: UserInfo
}

export async function register(email: string, password: string, displayName: string, familyCode: string) {
  const data = await request<TokenResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, display_name: displayName, family_code: familyCode }),
  })
  setToken(data.access_token)
  return data.user
}

export async function login(email: string, password: string) {
  const data = await request<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.access_token)
  return data.user
}

export async function getMe() {
  return request<UserInfo>('/api/auth/me')
}

// Persons
export interface Person {
  id: number
  old_id: string | null
  name: string
  generation: number | null
  branch: string | null
  gender: string | null
  birth_year: string | null
  death_year: string | null
  is_alive: boolean
  spouse: string | null
  bio: string | null
  father_id: number | null
}

export interface TreeNode extends Omit<Person, 'father_id'> {
  children: TreeNode[]
}

export interface Stats {
  total: number
  generations: number
  branches: number
  alive: number
}

export async function getPersons(params?: { branch?: string; generation?: number; name?: string }) {
  const qs = new URLSearchParams()
  if (params?.branch) qs.set('branch', params.branch)
  if (params?.generation !== undefined) qs.set('generation', String(params.generation))
  if (params?.name) qs.set('name', params.name)
  const query = qs.toString()
  return request<Person[]>(`/api/persons${query ? `?${query}` : ''}`)
}

export async function getPerson(id: number) {
  return request<Person>(`/api/persons/${id}`)
}

export async function getTree() {
  return request<TreeNode[]>('/api/tree')
}

export async function getStats() {
  return request<Stats>('/api/stats')
}
