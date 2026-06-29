<template>
  <div class="department">
    <div class="header">
      <span class="title">部门列表</span>
      <el-button type="primary" v-permission="PERMISSION.SYSTEM_DEPARTMENT_CREATE" @click="handleNewDepartment">新建部门</el-button>
    </div>
    <div class="table">
      <el-table :data="departmentList" border style="width: 100%" highlight-current-row>
        <el-table-column align="center" type="index" label="序号" width="55" />
        <el-table-column align="center" prop="name" label="部门名称" width="150" />
        <el-table-column align="center" prop="parent_id" label="上级部门ID" width="120" />
        <el-table-column align="center" prop="leader" label="负责人" />
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
              v-permission="PERMISSION.SYSTEM_DEPARTMENT_UPDATE"
              @click="handleEditDepartment(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="warning"
              text
              size="small"
              icon="delete"
              v-permission="PERMISSION.SYSTEM_DEPARTMENT_DELETE"
              @click="handleDeleteDepartment(scope.row.id)"
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
        :total="departmentTotalCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 部门编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑部门" width="500px">
      <el-form :model="departmentForm" label-width="100px" ref="formRef" :rules="formRules">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="departmentForm.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="上级部门ID" prop="parent_id">
          <el-input v-model.number="departmentForm.parent_id" placeholder="请输入上级部门ID" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="departmentForm.leader" placeholder="请输入负责人" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmDepartment">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="department">
import { ref, reactive } from "vue"
import { useSystemStore } from "@/stores/main/system/system"
import { storeToRefs } from "pinia"
import { formatDayjs } from "@/utils/format"
import { ElMessage, ElMessageBox } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import { PERMISSION } from "@/global/constant"

// 发起action，请求部门数据
const systemStore = useSystemStore()

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)

// 获取部门列表和总数
const { departmentList, departmentTotalCount } = storeToRefs(systemStore)

// 弹窗相关
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editingId = ref(0) // 存储正在编辑的部门ID
const departmentForm = reactive({
  name: "",
  parent_id: 0,
  leader: ""
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: "请输入部门名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ],
  parent_id: [
    { required: true, message: "请输入上级部门ID", trigger: "blur" },
    { type: "number", message: "上级部门ID必须是数字", trigger: "blur" }
  ],
  leader: [
    { required: true, message: "请输入负责人", trigger: "blur" },
    { max: 20, message: "长度不能超过 20 个字符", trigger: "blur" }
  ]
}

// 初始化数据
fetchDepartmentData()

// 获取部门数据
function fetchDepartmentData(queryData?: any) {
  const size = pageSize.value
  const page = currentPage.value
  const pageInfo = { size, page }
  systemStore.getDepartmentListAction(pageInfo)
}

// 分页器逻辑
function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchDepartmentData()
}

function handleCurrentChange(page: number) {
  currentPage.value = page
  fetchDepartmentData()
}

// 新建部门
function handleNewDepartment() {
  isEdit.value = false
  editingId.value = 0
  Object.assign(departmentForm, {
    name: "",
    parent_id: 0,
    leader: ""
  })
  dialogVisible.value = true
}

// 编辑部门
function handleEditDepartment(row: any) {
  isEdit.value = true
  editingId.value = row.id
  Object.assign(departmentForm, {
    name: row.name,
    parent_id: row.parent_id,
    leader: row.leader
  })
  dialogVisible.value = true
}

// 删除部门
function handleDeleteDepartment(id: number) {
  ElMessageBox.confirm("此操作将永久删除该部门, 是否继续?", "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      await systemStore.deleteDepartmentByIdAction(id)
      // 重新获取数据
      fetchDepartmentData()
    })
    .catch(() => {
      ElMessage.info("已取消删除")
    })
}

// 确认保存部门
const confirmDepartment = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 编辑部门
          const updatedDepartment = { ...departmentForm, id: editingId.value }
          await systemStore.updateDepartmentAction(updatedDepartment)
        } else {
          // 新建部门
          await systemStore.createDepartmentAction(departmentForm)
        }
        dialogVisible.value = false
        // 重置分页到第一页
        currentPage.value = 1
        fetchDepartmentData()
      } catch (error) {
        console.error("操作失败:", error)
      }
    }
  })
}
</script>

<style lang="less" scoped>
.department {
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
