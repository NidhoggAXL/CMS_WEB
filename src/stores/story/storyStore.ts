import {
  createStoryData,
  deleteStoryData,
  getStoryDetailData,
  getStoryListData,
  saveStoryChatMessagesData,
  updateStoryData
} from "@/servers/main/story"
import type { Story, StoryChatMessage, StoryDetail } from "@/types/story/story"
import { defineStore } from "pinia"

interface IStoryState {
  stories: Story[]
  totalCount: number
}

function normalizeMessage(message: StoryChatMessage): StoryChatMessage {
  return {
    id: message.id,
    storyId: message.storyId,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp
  }
}

const useStoryStore = defineStore("story", {
  state: (): IStoryState => ({
    stories: [],
    totalCount: 0
  }),
  getters: {
    sortedStories: (state) =>
      [...state.stories].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
  },
  actions: {
    async loadStoriesAction(query: { title?: string; genre?: string } = {}) {
      const result = await getStoryListData({
        offset: 0,
        size: 200,
        title: query.title,
        genre: query.genre
      })
      this.stories = result.data.data.list
      this.totalCount = result.data.data.totalCount
    },
    getStoryById(id: number) {
      return this.stories.find((item) => item.id === id)
    },
    async fetchStoryDetailAction(id: number): Promise<StoryDetail | null> {
      const result = await getStoryDetailData(id)
      const detail = result.data.data as StoryDetail
      const index = this.stories.findIndex((item) => item.id === id)
      if (index !== -1) {
        this.stories[index] = detail
      } else {
        this.stories.unshift(detail)
      }
      return detail
    },
    async saveStoryAction(story: {
      id?: number
      title: string
      genre: string
      content: string
      summary?: string
      messages?: Array<Pick<StoryChatMessage, "role" | "content">>
    }): Promise<Story> {
      if (story.id) {
        const result = await updateStoryData(story.id, {
          title: story.title,
          genre: story.genre,
          content: story.content,
          summary: story.summary
        })
        const savedStory = result.data.data as Story
        const index = this.stories.findIndex((item) => item.id === savedStory.id)
        if (index !== -1) {
          this.stories[index] = savedStory
        } else {
          this.stories.unshift(savedStory)
        }
        if (story.messages?.length) {
          await this.saveChatMessagesAction(savedStory.id, story.messages)
        }
        return savedStory
      }

      const result = await createStoryData({
        title: story.title,
        genre: story.genre,
        content: story.content,
        summary: story.summary,
        messages: story.messages
      })
      const savedStory = result.data.data as Story
      this.stories.unshift(savedStory)
      this.totalCount += 1
      return savedStory
    },
    async deleteStoryAction(id: number) {
      await deleteStoryData(id)
      this.stories = this.stories.filter((item) => item.id !== id)
      this.totalCount = Math.max(0, this.totalCount - 1)
    },
    async loadChatMessagesAction(storyId: number): Promise<StoryChatMessage[]> {
      const detail = await this.fetchStoryDetailAction(storyId)
      return (detail?.messages || []).map(normalizeMessage)
    },
    async saveChatMessagesAction(
      storyId: number,
      messages: Array<Pick<StoryChatMessage, "role" | "content">>
    ) {
      const result = await saveStoryChatMessagesData(storyId, messages)
      return (result.data.data as StoryChatMessage[]).map(normalizeMessage)
    }
  }
})

export default useStoryStore
