import type { ChatMessage } from './types'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
const TIMEOUT_MS = Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS ?? 60_000)

function endpoint(path: string): string {
  return `${API_BASE}${path}`
}

interface StreamError {
  message: string
}

/**
 * Stream a chat completion from the ChatMina model API.
 * Yields incremental text deltas using an OpenAI-style SSE protocol.
 */
export async function* streamCompletion(
  model: string,
  messages: Pick<ChatMessage, 'role' | 'content'>[],
): AsyncGenerator<string, void, void> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(endpoint('/v1/chat/completions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ model, messages, stream: true }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('The request timed out before the model responded.')
    }
    throw new Error('Unable to reach the model service. Check the API address and your connection.')
  } finally {
    window.clearTimeout(timeoutId)
  }

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '')
    let message = `The model service returned an error (${response.status}).`
    try {
      const parsed = JSON.parse(detail) as { error?: StreamError; detail?: string }
      message = parsed.error?.message ?? parsed.detail ?? message
    } catch {
      if (detail) message = detail
    }
    throw new Error(message)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue

        const payload = trimmed.slice(5).trim()
        if (payload === '[DONE]') return

        try {
          const chunk = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string } }>
            error?: StreamError
          }
          if (chunk.error) {
            throw new Error(chunk.error.message ?? 'The model service returned an error.')
          }
          const delta = chunk.choices?.[0]?.delta?.content
          if (typeof delta === 'string' && delta.length > 0) {
            yield delta
          }
        } catch (err) {
          // Ignore malformed partial frames; rethrow genuine application errors.
          if (!(err instanceof SyntaxError)) throw err
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
