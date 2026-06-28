import { TOKEN } from "@/global/constant"
import { BASE_URL } from "@/servers/config"
import { localCache } from "@/utils/cache"
import { ref } from "vue"

const DEFAULT_MODEL = "glm-4-flash"

interface Message {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AIGenerateOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface StreamChatOptions extends AIGenerateOptions {
  onDelta?: (chunk: string) => void
}

async function parseErrorResponse(response: Response) {
  try {
    const data = (await response.json()) as { message?: string; error?: { message?: string } }
    return data.message || data.error?.message || `请求失败 (${response.status})`
  } catch {
    return `请求失败 (${response.status})`
  }
}

async function consumeSSEStream(
  response: Response,
  onDelta?: (chunk: string) => void
): Promise<string> {
  if (!response.body) {
    throw new Error("AI 服务未返回流式数据")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let fullContent = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() || ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith("data:")) continue

      const data = trimmed.slice(5).trim()
      if (!data || data === "[DONE]") continue

      try {
        const json = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>
        }
        const chunk = json.choices?.[0]?.delta?.content || ""
        if (!chunk) continue
        fullContent += chunk
        onDelta?.(chunk)
      } catch {
        // 忽略无法解析的行
      }
    }
  }

  return fullContent
}

async function streamRequest(messages: Message[], options: StreamChatOptions = {}) {
  const token = localCache.getItem(TOKEN)
  if (!token) {
    throw new Error("请先登录后再使用 AI 功能")
  }

  const { model = DEFAULT_MODEL, temperature = 0.7, maxTokens = 1800, onDelta } = options

  const response = await fetch(`${BASE_URL}/ai/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      messages,
      model,
      temperature,
      maxTokens
    })
  })

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }

  return consumeSSEStream(response, onDelta)
}

export function useAI() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const chatStream = async (
    history: Array<{ role: "user" | "assistant"; content: string }>,
    options: StreamChatOptions = {}
  ): Promise<string> => {
    loading.value = true
    error.value = null

    const { systemPrompt, onDelta, ...rest } = options
    const messages: Message[] = []

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt })
    }

    history.forEach((item) => {
      messages.push({ role: item.role, content: item.content })
    })

    try {
      return await streamRequest(messages, { ...rest, onDelta })
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "AI 流式调用失败"
      error.value = errMsg
      console.error("AI 流式对话失败：", errMsg)
      throw new Error(errMsg)
    } finally {
      loading.value = false
    }
  }

  const generate = async (prompt: string, options: AIGenerateOptions = {}) => {
    return chatStream([{ role: "user", content: prompt }], options)
  }

  return { loading, error, chatStream, generate }
}
