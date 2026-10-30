import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage, Conversation } from '../lib/types'
import { DEFAULT_MODEL_ID, MODELS } from '../lib/models'
import { createId, deriveTitle } from '../lib/utils'
import { streamCompletion } from '../lib/api'
import {
  loadConversations,
  loadSelectedModel,
  loadSidebarCollapsed,
  saveConversations,
  saveSelectedModel,
  saveSidebarCollapsed,
} from '../lib/storage'

function initialModel(): string {
  const stored = loadSelectedModel()
  return stored && MODELS.some((m) => m.id === stored) ? stored : DEFAULT_MODEL_ID
}

export function useChatMina() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [modelId, setModelId] = useState<string>(initialModel)
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(loadSidebarCollapsed)
  const stopRequestedRef = useRef(false)

  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

  useEffect(() => {
    saveSelectedModel(modelId)
  }, [modelId])

  useEffect(() => {
    saveSidebarCollapsed(sidebarCollapsed)
  }, [sidebarCollapsed])

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  const newConversation = useCallback(() => {
    setActiveId(null)
  }, [])

  const selectConversation = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeId === id) setActiveId(null)
    },
    [activeId],
  )

  const changeModel = useCallback((next: string) => {
    setModelId(next)
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, modelId: next } : c)),
    )
  }, [activeId])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((v) => !v)
  }, [])

  const stopGeneration = useCallback(() => {
    stopRequestedRef.current = true
  }, [])

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || isStreaming) return

      const now = Date.now()
      const userMessage: ChatMessage = {
        id: createId(),
        role: 'user',
        content: text,
        createdAt: now,
      }
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content: '',
        createdAt: now + 1,
      }

      let targetId = activeId
      let historyMessages: ChatMessage[] = []

      if (targetId) {
        const current = conversations.find((c) => c.id === targetId)
        historyMessages = current ? current.messages : []
      }

      if (!targetId) {
        targetId = createId()
        const conversation: Conversation = {
          id: targetId,
          title: deriveTitle(text),
          modelId,
          messages: [userMessage, assistantMessage],
          createdAt: now,
          updatedAt: now,
        }
        setConversations((prev) => [conversation, ...prev])
        setActiveId(targetId)
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? {
                  ...c,
                  modelId,
                  updatedAt: now,
                  messages: [...c.messages, userMessage, assistantMessage],
                }
              : c,
          ),
        )
      }

      const requestHistory = [...historyMessages, userMessage]
        .filter((m) => m.role !== 'system' && !m.error)
        .map((m) => ({ role: m.role, content: m.content }))

      stopRequestedRef.current = false
      setIsStreaming(true)
      let accumulated = ''

      try {
        for await (const delta of streamCompletion(modelId, requestHistory)) {
          if (stopRequestedRef.current) break
          accumulated += delta
          const snapshot = accumulated
          setConversations((prev) =>
            prev.map((c) =>
              c.id === targetId
                ? {
                    ...c,
                    updatedAt: Date.now(),
                    messages: c.messages.map((m) =>
                      m.id === assistantMessage.id ? { ...m, content: snapshot } : m,
                    ),
                  }
                : c,
            ),
          )
        }

        if (!accumulated) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === targetId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMessage.id
                        ? {
                            ...m,
                            error: true,
                            content: 'The model returned an empty response. Please try again.',
                          }
                        : m,
                    ),
                  }
                : c,
            ),
          )
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'The model service failed. Please try again.'
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMessage.id ? { ...m, error: true, content: message } : m,
                  ),
                }
              : c,
          ),
        )
      } finally {
        setIsStreaming(false)
      }
    },
    [activeId, conversations, isStreaming, modelId],
  )

  return {
    conversations,
    activeConversation,
    activeId,
    modelId,
    isStreaming,
    sidebarCollapsed,
    newConversation,
    selectConversation,
    deleteConversation,
    changeModel,
    toggleSidebar,
    stopGeneration,
    sendMessage,
  }
}
