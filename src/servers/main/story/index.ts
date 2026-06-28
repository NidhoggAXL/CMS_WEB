import xlRequest from "../.."
import type { Story, StoryChatMessage } from "@/types/story/story"

export interface StoryListQuery {
  offset?: number
  size?: number
  title?: string
  genre?: string
}

export function getStoryListData(queryInfo: StoryListQuery = {}) {
  return xlRequest.get({
    url: "/stories/list",
    params: queryInfo
  })
}

export function getStoryDetailData(id: number) {
  return xlRequest.get({
    url: `/stories/${id}`
  })
}

export function createStoryData(data: {
  title: string
  genre: string
  content: string
  summary?: string
  messages?: Array<Pick<StoryChatMessage, "role" | "content">>
}) {
  return xlRequest.post({
    url: "/stories",
    data
  })
}

export function updateStoryData(
  id: number,
  data: {
    title?: string
    genre?: string
    content?: string
    summary?: string
  }
) {
  return xlRequest.patch({
    url: `/stories/${id}`,
    data
  })
}

export function deleteStoryData(id: number) {
  return xlRequest.delete({
    url: `/stories/${id}`
  })
}

export function saveStoryChatMessagesData(
  id: number,
  messages: Array<Pick<StoryChatMessage, "role" | "content">>
) {
  return xlRequest.put({
    url: `/stories/${id}/messages`,
    data: { messages }
  })
}
