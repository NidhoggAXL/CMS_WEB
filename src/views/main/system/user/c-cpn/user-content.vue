<script setup lang="ts">
import { useSystemStore } from "@/stores/main/system/system"
import { formatDayjs } from "@/utils/format"
import { storeToRefs } from "pinia"
import { ref } from "vue"
import { PERMISSION } from "@/global/constant"

//发起action，请求usersystem数据
const systemStore = useSystemStore()
//分页数据
const currentPage = ref(1)
const pageSize = ref(10)
//获取数据
fetchUserData()
//获取userList，userTotalCount数据
const { userList, userTotalCount } = storeToRefs(systemStore)
// console.log(userList.value, userTotalCount.value)

//暴露方法
defineExpose({ fetchUserData })

//发送事件
const emit = defineEmits(["newUser", "updataUser"])

//分页器逻辑
function handleSizeChange(size: number) {
  pageSize.value = size
  fetchUserData()
}
function handleCurrentChange(page: number) {
  currentPage.value = page
  fetchUserData()
}
//封装分页数据请求函数
function fetchUserData(queryData?: any) {
  // console.log(queryData)
  const size = pageSize.value
  const page = currentPage.value
  const pageInfo = { size, page }
  systemStore.postUserListAction(pageInfo, queryData)
}

//删除按钮
function handleRemoveBtnClick(id: number) {
  systemStore.deleteUserBayIdAction(id)
}

//新建用户按钮
function handleNewUserBtnClick() {
  emit("newUser")
}

//编辑用户按钮
function updataUserInfoBtnClick(userInfo: any) {
  emit("updataUser", userInfo)
}
</script>

<template>
  <div class="user-content">
    <div class="header">
      <span class="title">用户列表</span>
      <el-button type="primary" v-permission="PERMISSION.SYSTEM_USER_CREATE" @click="handleNewUserBtnClick">新建用户</el-button>
    </div>
    <div class="table">
      <el-table :data="userList" border style="width: 100%" highlight-current-row>
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="center" type="index" label="序号" width="55" />
        <el-table-column align="center" prop="name" label="用户名" width="150" />
        <el-table-column align="center" prop="realname" label="真实姓名" width="150" />
        <el-table-column align="center" prop="cellphone" label="手机号码" width="150" />
        <el-table-column align="center" prop="enable" label="状态" width="70">
          <!-- 作用域插槽 -->
          <template #default="scope">
            <el-button :type="scope.row.enable ? 'primary' : 'danger'" plain>
              {{ scope.row.enable ? "启用" : "禁用" }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="createAt" label="创建时间">
          <template #default="scope">
            {{ formatDayjs(scope.row.createAt) }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="updateAt" label="跟新时间">
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
              v-permission="PERMISSION.SYSTEM_USER_UPDATE"
              @click="updataUserInfoBtnClick(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="warning"
              text
              size="small"
              icon="delete"
              v-permission="PERMISSION.SYSTEM_USER_DELETE"
              @click="handleRemoveBtnClick(scope.row.id)"
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
        :page-sizes="[10, 20, 30, 40]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="userTotalCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.user-content {
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
