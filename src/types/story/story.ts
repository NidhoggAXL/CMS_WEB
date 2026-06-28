export interface Story {
  id: number
  userId?: number
  title: string
  content: string
  genre: string
  summary?: string
  createdAt: string
  updatedAt: string
}

export interface StoryChatMessage {
  id?: number
  storyId?: number
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface StoryDetail extends Story {
  messages?: StoryChatMessage[]
}

export type StoryGenre =
  | "童话"
  | "科幻"
  | "悬疑"
  | "爱情"
  | "冒险"
  | "历史"
  | "奇幻"
  | "其他"

export const STORY_GENRES: StoryGenre[] = [
  "童话",
  "科幻",
  "悬疑",
  "爱情",
  "冒险",
  "历史",
  "奇幻",
  "其他"
]
