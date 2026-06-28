<template>
  <div class="story-list">
    <section class="hero-panel">
      <div class="hero-copy">
        <h2 class="hero-title">故事列表</h2>
      </div>
      <div class="hero-actions">
        <el-statistic title="故事总数" :value="filteredStories.length" />
        <el-button type="primary" size="large" @click="handleCreateStory">
          <el-icon><Plus /></el-icon>
          新建故事
        </el-button>
      </div>
    </section>

    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" @submit.prevent>
        <el-form-item label="标题">
          <el-input
            v-model="searchForm.title"
            placeholder="搜索故事标题"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.genre" placeholder="全部类型" clearable style="width: 140px">
            <el-option v-for="genre in STORY_GENRES" :key="genre" :label="genre" :value="genre" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="pagedStories" stripe style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="genre" label="类型" width="100">
          <template #default="{ row }">
            <el-tag type="primary" effect="light" round>{{ row.genre }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="summary" label="摘要" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.summary || getSummary(row.content) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="success" @click="handleContinue(row)">继续创作</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!filteredStories.length" class="empty-wrap">
        <el-empty description="还没有故事，去 AI 创作页写一篇吧">
          <el-button type="primary" @click="handleCreateStory">开始创作</el-button>
        </el-empty>
      </div>

      <div v-if="filteredStories.length" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          :total="filteredStories.length"
        />
      </div>
    </el-card>

    <el-drawer v-model="detailVisible" :title="currentStory?.title || '故事详情'" size="520px">
      <template v-if="currentStory">
        <div class="detail-meta">
          <el-tag type="primary" round>{{ currentStory.genre }}</el-tag>
          <span>{{ formatTime(currentStory.updatedAt) }}</span>
        </div>
        <div class="detail-content">{{ currentStory.content }}</div>
        <div class="detail-actions">
          <el-button type="primary" @click="handleContinue(currentStory)">继续创作</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts" name="list">
import { computed, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { Plus } from "@element-plus/icons-vue"
import dayjs from "dayjs"
import useStoryStore from "@/stores/story/storyStore"
import type { Story } from "@/types/story/story"
import { STORY_GENRES } from "@/types/story/story"

const router = useRouter()
const storyStore = useStoryStore()

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const currentStory = ref<Story | null>(null)

const searchForm = reactive({
  title: "",
  genre: ""
})

const appliedSearch = reactive({
  title: "",
  genre: ""
})

const filteredStories = computed(() => {
  return storyStore.sortedStories.filter((item) => {
    const matchTitle = !appliedSearch.title || item.title.includes(appliedSearch.title)
    const matchGenre = !appliedSearch.genre || item.genre === appliedSearch.genre
    return matchTitle && matchGenre
  })
})

const pagedStories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStories.value.slice(start, start + pageSize.value)
})

function formatTime(value: string) {
  return dayjs(value).format("YYYY-MM-DD HH:mm")
}

function getSummary(content: string) {
  return content.length > 60 ? `${content.slice(0, 60)}...` : content
}

function handleSearch() {
  appliedSearch.title = searchForm.title.trim()
  appliedSearch.genre = searchForm.genre
  currentPage.value = 1
  fetchStories()
}

function handleReset() {
  searchForm.title = ""
  searchForm.genre = ""
  appliedSearch.title = ""
  appliedSearch.genre = ""
  currentPage.value = 1
  fetchStories()
}

async function fetchStories() {
  loading.value = true
  try {
    await storyStore.loadStoriesAction({
      title: appliedSearch.title,
      genre: appliedSearch.genre
    })
  } catch {
    ElMessage.error("加载故事列表失败，请检查后端服务")
  } finally {
    loading.value = false
  }
}

function handleCreateStory() {
  router.push("/main/story/chat")
}

function handleView(story: Story) {
  currentStory.value = story
  detailVisible.value = true
}

function handleContinue(story: Story) {
  router.push({ path: "/main/story/chat", query: { id: story.id } })
}

async function handleDelete(story: Story) {
  try {
    await ElMessageBox.confirm(`确定删除故事「${story.title}」吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消"
    })
    await storyStore.deleteStoryAction(story.id)
    ElMessage.success("删除成功")
    if (currentStory.value?.id === story.id) {
      detailVisible.value = false
      currentStory.value = null
    }
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  fetchStories()
})
</script>

<style scoped lang="less">
.story-list {
  min-height: calc(100vh - 60px);
  padding: 20px;
  background:
    radial-gradient(circle at top left, rgba(103, 58, 183, 0.12), transparent 24%),
    linear-gradient(180deg, #f8f5ff 0%, #f3f6fb 100%);
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
  padding: 28px 30px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 40px rgba(16, 42, 67, 0.06);
}

.hero-title {
  margin: 0;
  color: #102a43;
  font-size: 30px;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 16px;
}

.search-card,
.table-card {
  margin-bottom: 20px;
  border: none;
  border-radius: 20px;
}

.empty-wrap {
  padding: 24px 0;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0 8px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  color: #7b8794;
  font-size: 13px;
}

.detail-content {
  color: #334e68;
  font-size: 15px;
  line-height: 1.9;
  white-space: pre-wrap;
}

.detail-actions {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .hero-panel {
    flex-direction: column;
  }

  .hero-actions {
    align-items: flex-start;
  }
}
</style>
