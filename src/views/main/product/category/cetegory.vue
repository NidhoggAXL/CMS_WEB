<template>
  <div class="category-page">
    <section class="hero-panel">
      <div>
        <h2 class="hero-title">商品分类管理</h2>
      </div>

      <div class="hero-actions">
        <el-button type="primary" @click="openCreateDialog()">
          <el-icon><Plus /></el-icon>
          新增分类
        </el-button>
        <el-button @click="expandAll">全部展开</el-button>
        <el-button @click="collapseAll">全部折叠</el-button>
      </div>
    </section>

    <section class="overview-grid">
      <el-card shadow="hover">
        <div class="stat-card">
          <span class="stat-label">分类总数</span>
          <strong class="stat-value">{{ categories.length }}</strong>
        </div>
      </el-card>
      <el-card shadow="hover">
        <div class="stat-card">
          <span class="stat-label">顶级分类</span>
          <strong class="stat-value">{{ rootCount }}</strong>
        </div>
      </el-card>
      <el-card shadow="hover">
        <div class="stat-card">
          <span class="stat-label">叶子节点</span>
          <strong class="stat-value">{{ leafCount }}</strong>
        </div>
      </el-card>
    </section>

    <el-card class="tree-card" shadow="never">
      <template #header>
        <div class="tree-card-header">
          <div>
            <h3>分类树</h3>
            <p>点击左侧箭头即可展开或折叠子分类</p>
          </div>
        </div>
      </template>

      <el-empty v-if="!treeData.length" description="暂无分类数据">
        <el-button type="primary" @click="openCreateDialog()">立即新增</el-button>
      </el-empty>

      <el-tree
        v-else
        :key="treeRenderKey"
        :data="treeData"
        node-key="id"
        :props="treeProps"
        :expand-on-click-node="false"
        :default-expanded-keys="expandedKeys"
        class="category-tree"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
      >
        <template #default="{ data }">
          <div class="tree-node">
            <div class="tree-node__main">
              <span class="tree-node__name">{{ data.name }}</span>
              <span class="tree-node__meta">排序 {{ data.sort }}</span>
              <span class="tree-node__meta">
                {{ data.parent_id === 0 ? "顶级分类" : `父级 ID: ${data.parent_id}` }}
              </span>
            </div>

            <div class="tree-node__actions">
              <el-button size="small" @click.stop="openCreateDialog(data)">新增子分类</el-button>
              <el-button size="small" type="primary" plain @click.stop="openEditDialog(data)">
                编辑
              </el-button>
              <el-button size="small" type="danger" plain @click.stop="handleDelete(data)">
                删除
              </el-button>
            </div>
          </div>
        </template>
      </el-tree>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" maxlength="50" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="父级分类" prop="parent_id">
          <el-select v-model="formData.parent_id" style="width: 100%">
            <el-option :value="0" label="顶级分类" />
            <el-option
              v-for="item in parentOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="1" :step="1" style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="category">
import { computed, nextTick, onMounted, reactive, ref } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { Plus } from "@element-plus/icons-vue"
import type { FormInstance, FormRules } from "element-plus"
import {
  createCategoryData,
  deleteCategoryData,
  getCategoryListData,
  updateCategoryData
} from "@/servers/main/category/index"

interface CategoryItem {
  id: number
  name: string
  parent_id: number
  sort: number
  create_at: string
  update_at: string
}

interface CategoryTreeItem extends CategoryItem {
  children?: CategoryTreeItem[]
}

interface CategoryForm {
  name: string
  parent_id: number
  sort: number
}

const categories = ref<CategoryItem[]>([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const treeRenderKey = ref(0)
const expandedKeys = ref<number[]>([])

const formData = reactive<CategoryForm>({
  name: "",
  parent_id: 0,
  sort: 1
})

const treeProps = {
  children: "children",
  label: "name"
}

const formRules: FormRules<CategoryForm> = {
  name: [
    { required: true, message: "请输入分类名称", trigger: "blur" },
    { min: 2, max: 50, message: "分类名称长度需要在 2 到 50 个字符之间", trigger: "blur" }
  ],
  parent_id: [{ required: true, message: "请选择父级分类", trigger: "change" }],
  sort: [{ required: true, message: "请输入排序值", trigger: "blur" }]
}

const treeData = computed<CategoryTreeItem[]>(() => buildTree(categories.value))

const rootCount = computed(() => categories.value.filter((item) => item.parent_id === 0).length)

const leafCount = computed(() => {
  const parentIds = new Set(categories.value.map((item) => item.parent_id))
  return categories.value.filter((item) => !parentIds.has(item.id)).length
})

const parentOptions = computed(() => {
  const disabledIds = editingId.value === null ? new Set<number>() : collectDescendantIds(editingId.value)

  return flattenTree(treeData.value)
    .filter((item) => !disabledIds.has(item.id))
    .map((item) => ({
      id: item.id,
      label: `${"— ".repeat(item.level)}${item.name}`
    }))
})

function buildTree(list: CategoryItem[]): CategoryTreeItem[] {
  const nodeMap = new Map<number, CategoryTreeItem>()
  const roots: CategoryTreeItem[] = []

  list.forEach((item) => {
    nodeMap.set(item.id, { ...item, children: [] })
  })

  list.forEach((item) => {
    const current = nodeMap.get(item.id)
    if (!current) return

    if (item.parent_id === 0) {
      roots.push(current)
      return
    }

    const parent = nodeMap.get(item.parent_id)
    if (parent) {
      parent.children!.push(current)
    } else {
      roots.push(current)
    }
  })

  const sortNodes = (nodes: CategoryTreeItem[]) => {
    nodes.sort((a, b) => a.sort - b.sort || a.id - b.id)
    nodes.forEach((node) => {
      if (node.children?.length) {
        sortNodes(node.children)
      } else {
        delete node.children
      }
    })
  }

  sortNodes(roots)
  return roots
}

function flattenTree(
  nodes: CategoryTreeItem[],
  level = 0
): Array<{ id: number; name: string; level: number }> {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, level },
    ...(node.children ? flattenTree(node.children, level + 1) : [])
  ])
}

function collectDescendantIds(targetId: number) {
  const ids = new Set<number>([targetId])
  const queue = [targetId]

  while (queue.length) {
    const parentId = queue.shift()!
    categories.value
      .filter((item) => item.parent_id === parentId)
      .forEach((item) => {
        if (!ids.has(item.id)) {
          ids.add(item.id)
          queue.push(item.id)
        }
      })
  }

  return ids
}

async function loadCategories() {
  const result = await getCategoryListData()
  categories.value = result.data.data.list
  if (!expandedKeys.value.length) {
    expandedKeys.value = categories.value.filter((item) => item.parent_id === 0).map((item) => item.id)
  }
}

onMounted(() => {
  loadCategories()
})

function refreshTree(expandIds?: number[]) {
  if (expandIds) {
    expandedKeys.value = [...new Set(expandIds)]
  }

  treeRenderKey.value += 1
}

function openCreateDialog(parent?: CategoryItem) {
  isEdit.value = false
  editingId.value = null
  formData.name = ""
  formData.parent_id = parent?.id ?? 0
  formData.sort = 1
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function openEditDialog(category: CategoryItem) {
  isEdit.value = true
  editingId.value = category.id
  formData.name = category.name
  formData.parent_id = category.parent_id
  formData.sort = category.sort
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function expandAll() {
  refreshTree(categories.value.map((item) => item.id))
}

function collapseAll() {
  refreshTree([])
}

function handleNodeExpand(data: CategoryItem) {
  if (!expandedKeys.value.includes(data.id)) {
    expandedKeys.value = [...expandedKeys.value, data.id]
  }
}

function handleNodeCollapse(data: CategoryItem) {
  const removeIds = collectDescendantIds(data.id)
  expandedKeys.value = expandedKeys.value.filter((id) => id !== data.id && !removeIds.has(id))
}

async function handleSave() {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const payload = {
    name: formData.name.trim(),
    parent_id: formData.parent_id,
    sort: formData.sort
  }

  try {
    if (isEdit.value && editingId.value !== null) {
      await updateCategoryData(editingId.value, payload)
      refreshTree([...expandedKeys.value, formData.parent_id, editingId.value].filter((id) => id > 0))
      ElMessage.success("分类更新成功")
    } else {
      await createCategoryData(payload)
      refreshTree([...expandedKeys.value, formData.parent_id].filter((id) => id > 0))
      ElMessage.success("分类添加成功")
    }
    dialogVisible.value = false
    await loadCategories()
  } catch {
    ElMessage.error(isEdit.value ? "分类更新失败" : "分类添加失败")
  }
}

async function handleDelete(category: CategoryItem) {
  const confirmed = await ElMessageBox.confirm(
    `确认删除分类“${category.name}”吗？`,
    "删除确认",
    {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    }
  ).catch(() => false)

  if (!confirmed) return

  try {
    await deleteCategoryData(category.id)
    const deleteIds = collectDescendantIds(category.id)
    expandedKeys.value = expandedKeys.value.filter((id) => !deleteIds.has(id))
    refreshTree(expandedKeys.value)
    ElMessage.success("分类删除成功")
    await loadCategories()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "分类删除失败"
    ElMessage.error(message)
  }
}
</script>

<style scoped lang="less">
.category-page {
  min-height: calc(100vh - 60px);
  padding: 20px;
  background:
    radial-gradient(circle at top left, rgba(24, 144, 255, 0.18), transparent 28%),
    linear-gradient(180deg, #f7fbff 0%, #eef4f8 100%);
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
  padding: 24px 28px;
  border: 1px solid rgba(18, 76, 136, 0.1);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 50px rgba(55, 84, 170, 0.08);
}

.hero-title {
  margin: 0;
  color: #102a43;
  font-size: 30px;
  line-height: 1.2;
}

.hero-actions {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-label {
  color: #7b8794;
  font-size: 13px;
}

.stat-value {
  color: #102a43;
  font-size: 32px;
  font-weight: 700;
}

.tree-card {
  border: none;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 40px rgba(16, 42, 67, 0.06);
}

.tree-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0 0 4px;
    color: #102a43;
    font-size: 20px;
  }

  p {
    margin: 0;
    color: #7b8794;
    font-size: 13px;
  }
}

.category-tree {
  :deep(.el-tree-node__content) {
    height: auto;
    padding: 10px 0;
  }

  :deep(.el-tree-node__expand-icon) {
    color: #1768ac;
    font-size: 16px;
  }
}

.tree-node {
  display: flex;
  flex: 1;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid #d9e2ec;
  border-radius: 18px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: #9fb3c8;
    box-shadow: 0 14px 28px rgba(16, 42, 67, 0.08);
  }
}

.tree-node__main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.tree-node__name {
  color: #102a43;
  font-size: 15px;
  font-weight: 700;
}

.tree-node__meta {
  padding: 4px 10px;
  border-radius: 999px;
  background: #edf4ff;
  color: #1768ac;
  font-size: 12px;
}

.tree-node__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 900px) {
  .hero-panel {
    flex-direction: column;
  }

  .hero-actions {
    flex-wrap: wrap;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .tree-node {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
