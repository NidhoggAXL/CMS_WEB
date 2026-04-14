<template>
  <div class="role">
    <div class="header">
      <span class="title">角色列表</span>
      <el-button type="primary" @click="handleNewRole">新建角色</el-button>
    </div>
    <div class="table">
      <el-table :data="roleList" border style="width: 100%" highlight-current-row>
        <el-table-column align="center" type="index" label="序号" width="55" />
        <el-table-column align="center" prop="id" label="ID" width="80" />
        <el-table-column align="center" prop="name" label="角色名称" width="150" />
        <el-table-column align="center" prop="intro" label="角色描述" />
        <el-table-column align="center" prop="createAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDayjs(scope.row.createAt) }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="updateAt" label="更新时间" width="180">
          <template #default="scope">
            {{ formatDayjs(scope.row.updateAt) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="150">
          <template #default="scope">
            <el-button
              type="primary"
              text
              size="small"
              icon="edit"
              @click="handleEditRole(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="warning"
              text
              size="small"
              icon="delete"
              @click="handleDeleteRole(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20, 30]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="roleTotalCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 角色编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑角色" width="500px">
      <el-form :model="roleForm" label-width="100px" ref="formRef" :rules="formRules">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="intro">
          <el-input v-model="roleForm.intro" type="textarea" placeholder="请输入角色描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRole">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="role">
import { ref, reactive } from "vue"
import { useSystemStore } from "@/stores/main/system/system"
import { storeToRefs } from "pinia"
import { formatDayjs } from "@/utils/format"
import type { FormInstance, FormRules } from "element-plus"

// 发起action，请求角色数据
const systemStore = useSystemStore()

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)

// 获取角色列表和总数
const { roleList, roleTotalCount } = storeToRefs(systemStore)

// 弹窗相关
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const roleForm = reactive({
  id: 0,
  name: "",
  intro: ""
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: "请输入角色名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ],
  intro: [
    { required: true, message: "请输入角色描述", trigger: "blur" },
    { max: 100, message: "长度不能超过 100 个字符", trigger: "blur" }
  ]
}

// 初始化数据
fetchRoleData()

// 获取角色数据
function fetchRoleData(queryData?: any) {
  const size = pageSize.value
  const page = currentPage.value
  const pageInfo = { size, page }
  systemStore.getRoleListAction(pageInfo)
}

// 分页器逻辑
function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchRoleData()
}

function handleCurrentChange(page: number) {
  currentPage.value = page
  fetchRoleData()
}

// 新建角色
function handleNewRole() {
  isEdit.value = false
  Object.assign(roleForm, {
    id: 0,
    name: "",
    intro: ""
  })
  dialogVisible.value = true
}

// 编辑角色
function handleEditRole(row: any) {
  isEdit.value = true
  Object.assign(roleForm, { ...row })
  dialogVisible.value = true
}

// 删除角色
function handleDeleteRole(id: number) {
  ElMessageBox.confirm("此操作将永久删除该角色, 是否继续?", "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      await systemStore.deleteRoleByIdAction(id)
      ElMessage.success("删除成功")
      // 重新获取数据
      fetchRoleData()
    })
    .catch(() => {
      ElMessage.info("已取消删除")
    })
}

// 确认保存角色
const confirmRole = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑角色
        systemStore.updateRoleAction(roleForm)
      } else {
        // 新建角色
        systemStore.createRoleAction(roleForm)
      }
      dialogVisible.value = false
      fetchRoleData()
    }
  })
}
</script>

<style lang="less" scoped>
.role {
  margin-top: 10px;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 60px;
    background-color: #fff;
    font-size: 22px;
    font-weight: 700;
  }

  .table {
    background-color: #fff;
    border-radius: 5px;
    margin-top: 10px;

    :deep(.el-table__cell) {
      padding: 15px 0;
    }

    .el-button {
      padding: 5px;
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin: 20px 0;
  }
}
</style>
