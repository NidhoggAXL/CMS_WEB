<template>
  <div class="story-chat">
    <section class="hero-panel">
      <div class="hero-copy">
        <h2 class="hero-title">AI 故事创作</h2>
      </div>
      <div class="hero-actions">
        <el-button @click="handleGoList">返回列表</el-button>
        <el-button type="primary" :loading="loading" @click="handleSaveStory">保存故事</el-button>
      </div>
    </section>

    <div class="chat-layout">
      <el-card class="config-card" shadow="never">
        <template #header>
          <div class="card-header">
            <h3>创作设置</h3>
            <p>配置故事基础信息</p>
          </div>
        </template>

        <el-form label-position="top">
          <el-form-item label="故事标题">
            <el-input v-model="storyForm.title" placeholder="例如：星际旅人的归途" maxlength="50" show-word-limit />
          </el-form-item>
          <el-form-item label="故事类型">
            <el-select v-model="storyForm.genre" placeholder="选择类型" style="width: 100%">
              <el-option v-for="genre in STORY_GENRES" :key="genre" :label="genre" :value="genre" />
            </el-select>
          </el-form-item>
          <el-form-item label="创作要求">
            <el-input
              v-model="storyForm.prompt"
              type="textarea"
              :rows="4"
              placeholder="描述主角、背景、风格或情节方向..."
            />
          </el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="handleGenerate">
            {{ messages.length ? "重新生成" : "开始生成" }}
          </el-button>
        </el-form>

        <div class="quick-prompts">
          <span class="quick-label">快捷灵感</span>
          <div class="prompt-tags">
            <el-tag
              v-for="item in quickPrompts"
              :key="item"
              class="prompt-tag"
              effect="plain"
              @click="applyQuickPrompt(item)"
            >
              {{ item }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <el-card class="chat-card" shadow="never">
        <template #header>
          <div class="card-header">
            <h3>创作对话</h3>
            <p>继续输入要求，让 AI 帮你修改或续写</p>
          </div>
        </template>

        <div ref="messageListRef" class="message-list">
          <div v-if="!messages.length" class="message-empty">
            <el-empty description="填写左侧设置后，点击「开始生成」创作你的第一个故事" />
          </div>

          <div
            v-for="(message, index) in messages"
            :key="`${message.timestamp}-${index}`"
            class="message-item"
            :class="message.role"
          >
            <div class="message-avatar">
              {{ message.role === "user" ? "我" : "AI" }}
            </div>
            <div class="message-bubble">
              <p>{{ message.content }}<span v-if="loading && message.role === 'assistant' && index === messages.length - 1 && !message.content" class="typing-cursor">|</span></p>
              <span v-if="message.content" class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="继续描述修改意见，例如：把结局改得更温暖一些..."
            @keydown.ctrl.enter="handleSendMessage"
          />
          <div class="chat-input-actions">
            <span class="hint">Ctrl + Enter 发送</span>
            <el-button type="primary" :disabled="!inputMessage.trim() || loading" @click="handleSendMessage">
              发送
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="chat">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import dayjs from "dayjs"
import { useAI } from "@/components/useAI/useAI"
import useStoryStore from "@/stores/story/storyStore"
import type { StoryChatMessage } from "@/types/story/story"
import { STORY_GENRES } from "@/types/story/story"

const route = useRoute()
const router = useRouter()
const storyStore = useStoryStore()
const { loading, chatStream } = useAI()

const storyId = ref<number | null>(null)
const inputMessage = ref("")
const messageListRef = ref<HTMLDivElement>()
const messages = ref<StoryChatMessage[]>([])

const storyForm = reactive({
  title: "",
  genre: "童话" as (typeof STORY_GENRES)[number],
  prompt: ""
})

const quickPrompts = [
  "写一个关于勇气的小故事",
  "科幻背景下的友情故事",
  "适合儿童阅读的睡前童话",
  "带有反转的悬疑短篇"
]

const systemPrompt = computed(() => {
  return `你是一位专业的中文故事创作者。请根据用户要求创作${storyForm.genre}类型的故事。
要求：
1. 语言流畅、情节完整，适合在 CMS 故事模块中展示
2. 故事长度控制在 600-1200 字
3. 直接输出故事正文，不要额外解释`
})

const latestStoryContent = computed(() => {
  const assistantMessages = messages.value.filter((item) => item.role === "assistant")
  const lastMessage = assistantMessages[assistantMessages.length - 1]
  return lastMessage ? lastMessage.content : ""
})

function formatTime(value: string) {
  return dayjs(value).format("HH:mm")
}

function createMessage(role: "user" | "assistant", content: string): StoryChatMessage {
  return {
    role,
    content,
    timestamp: new Date().toISOString()
  }
}

function applyQuickPrompt(prompt: string) {
  storyForm.prompt = prompt
}

function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

async function requestAI(userPrompt: string) {
  messages.value.push(createMessage("user", userPrompt))
  messages.value.push(createMessage("assistant", ""))
  const assistantIndex = messages.value.length - 1
  scrollToBottom()

  const history = messages.value
    .slice(0, -1)
    .filter((item) => item.content.trim())
    .map((item) => ({
      role: item.role,
      content: item.content
    }))

  try {
    await chatStream(history, {
      systemPrompt: systemPrompt.value,
      maxTokens: 1800,
      onDelta: (chunk) => {
        const assistantMessage = messages.value[assistantIndex]
        if (assistantMessage) {
          assistantMessage.content += chunk
        }
        scrollToBottom()
      }
    })

    const assistantMessage = messages.value[assistantIndex]
    if (!assistantMessage?.content.trim()) {
      messages.value.splice(assistantIndex, 1)
      throw new Error("AI 未返回有效内容")
    }

    if (storyId.value) {
      await storyStore.saveChatMessagesAction(
        storyId.value,
        messages.value.map((item) => ({ role: item.role, content: item.content }))
      )
    }
    scrollToBottom()
  } catch (error) {
    if (!messages.value[assistantIndex]?.content.trim()) {
      messages.value.splice(assistantIndex, 1)
    }
    throw error
  }
}

async function handleGenerate() {
  if (!storyForm.title.trim()) {
    ElMessage.warning("请先填写故事标题")
    return
  }
  if (!storyForm.prompt.trim()) {
    ElMessage.warning("请先填写创作要求")
    return
  }

  try {
    messages.value = []
    await requestAI(storyForm.prompt.trim())
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : "生成失败")
  }
}

async function handleSendMessage() {
  const content = inputMessage.value.trim()
  if (!content || loading.value) return

  if (!storyForm.title.trim()) {
    ElMessage.warning("请先填写故事标题")
    return
  }

  inputMessage.value = ""
  try {
    await requestAI(content)
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : "发送失败")
  }
}

async function handleSaveStory() {
  if (!storyForm.title.trim()) {
    ElMessage.warning("请填写故事标题")
    return
  }
  if (!latestStoryContent.value) {
    ElMessage.warning("请先生成故事内容")
    return
  }

  try {
    const saved = await storyStore.saveStoryAction({
      id: storyId.value ?? undefined,
      title: storyForm.title.trim(),
      genre: storyForm.genre,
      content: latestStoryContent.value,
      summary: latestStoryContent.value.slice(0, 80),
      messages: messages.value.map((item) => ({ role: item.role, content: item.content }))
    })

    storyId.value = saved.id
    router.replace({ path: "/main/story/chat", query: { id: String(saved.id) } })
    ElMessage.success("故事已保存到数据库")
  } catch {
    ElMessage.error("保存失败，请检查登录状态和后端服务")
  }
}

function handleGoList() {
  router.push("/main/story/list")
}

async function loadStoryFromRoute() {
  const idParam = route.query.id
  if (typeof idParam !== "string" || !idParam) {
    storyId.value = null
    messages.value = []
    storyForm.title = ""
    storyForm.genre = "童话"
    return
  }

  const id = Number(idParam)
  if (Number.isNaN(id)) {
    storyId.value = null
    return
  }

  try {
    const detail = await storyStore.fetchStoryDetailAction(id)
    if (!detail) {
      ElMessage.warning("故事不存在，已切换到新建模式")
      storyId.value = null
      return
    }

    storyId.value = detail.id
    storyForm.title = detail.title
    storyForm.genre = detail.genre as (typeof STORY_GENRES)[number]
    messages.value = (detail.messages || []).map((item) => ({
      role: item.role,
      content: item.content,
      timestamp: item.timestamp
    }))

    if (!messages.value.length && detail.content) {
      messages.value = [
        createMessage("user", "请根据已有故事继续创作或润色"),
        createMessage("assistant", detail.content)
      ]
    }
  } catch {
    ElMessage.error("加载故事失败，请检查后端服务")
  }
}

watch(
  () => route.query.id,
  () => {
    loadStoryFromRoute()
  }
)

onMounted(async () => {
  await storyStore.loadStoriesAction()
  await loadStoryFromRoute()
})
</script>

<style scoped lang="less">
.story-chat {
  min-height: calc(100vh - 60px);
  padding: 20px;
  background:
    radial-gradient(circle at top right, rgba(103, 58, 183, 0.14), transparent 24%),
    linear-gradient(180deg, #faf7ff 0%, #f3f6fb 100%);
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
  padding: 24px 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 40px rgba(16, 42, 67, 0.06);
}

.hero-title {
  margin: 0;
  color: #102a43;
  font-size: 28px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 16px;
}

.config-card,
.chat-card {
  border: none;
  border-radius: 20px;
}

.card-header {
  h3 {
    margin: 0 0 4px;
    color: #102a43;
    font-size: 18px;
  }

  p {
    margin: 0;
    color: #7b8794;
    font-size: 13px;
  }
}

.quick-prompts {
  margin-top: 20px;
}

.quick-label {
  display: block;
  margin-bottom: 10px;
  color: #7b8794;
  font-size: 13px;
}

.prompt-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.prompt-tag {
  cursor: pointer;
}

.message-list {
  height: 460px;
  overflow-y: auto;
  padding-right: 8px;
}

.message-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  &.user {
    flex-direction: row-reverse;

    .message-bubble {
      background: linear-gradient(135deg, #673ab7 0%, #9575cd 100%);
      color: #fff;
    }

    .message-time {
      color: rgba(255, 255, 255, 0.78);
    }
  }
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #edf2f7;
  color: #486581;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.message-bubble {
  max-width: 78%;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fafc;
  color: #334e68;

  p {
    margin: 0;
    line-height: 1.8;
    white-space: pre-wrap;
  }
}

.message-time {
  display: block;
  margin-top: 8px;
  color: #9fb3c8;
  font-size: 12px;
}

.typing-cursor {
  display: inline-block;
  margin-left: 2px;
  color: #673ab7;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.chat-input {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.chat-input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.hint {
  color: #9fb3c8;
  font-size: 12px;
}

@media (max-width: 960px) {
  .chat-layout {
    grid-template-columns: 1fr;
  }

  .message-list {
    height: 360px;
  }

  .hero-panel {
    flex-direction: column;
  }
}
</style>
