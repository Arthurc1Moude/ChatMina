export type Role = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: Role
  content: string
  createdAt: number
  error?: boolean
}

export interface Conversation {
  id: string
  title: string
  modelId: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export interface ModelInfo {
  id: string
  name: string
  tagline: string
  description: string
  maxTokens: number
}

export interface ChatCompletionRequest {
  model: string
  messages: Pick<ChatMessage, 'role' | 'content'>[]
  stream: boolean
}
