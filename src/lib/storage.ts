import type { Conversation } from './types'

const CONV_KEY = 'chatmina.conversations.v1'
const MODEL_KEY = 'chatmina.model.v1'
const SIDEBAR_KEY = 'chatmina.sidebar.v1'

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadConversations(): Conversation[] {
  if (typeof localStorage === 'undefined') return []
  const list = safeParse<Conversation[]>(localStorage.getItem(CONV_KEY), [])
  return Array.isArray(list) ? list : []
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(CONV_KEY, JSON.stringify(conversations))
}

export function loadSelectedModel(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(MODEL_KEY)
}

export function saveSelectedModel(modelId: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(MODEL_KEY, modelId)
}

export function loadSidebarCollapsed(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(SIDEBAR_KEY) === '1'
}

export function saveSidebarCollapsed(collapsed: boolean): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0')
}
