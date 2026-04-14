<script setup lang="ts">
import useImportantStore from "@/stores/important/important"
import { useSystemStore } from "@/stores/main/system/system"
import { storeToRefs } from "pinia"
import { reactive, ref } from "vue"

//定义对话框隐藏的初始化
const dialogVisible = ref(false)
//定义表单数据
const formData = reactive<any>({
  name: "",
  realname: "",
  password: "",
  cellphone: "",
  role_id: "",
  department_id: ""
})

//确实是否为编辑模式，默认不是
const isUpdata = ref(false)
//定义编辑的数据
const editeData = ref()
//定义显示和隐藏对话框
const handleShowDialog = (isEdit = false, userInfo?: any) => {
  if (userInfo && isEdit) {
    isUpdata.value = isEdit
    for (const key in userInfo) {
      formData[key] = userInfo[key]
    }
    editeData.value = userInfo
  } else {
    for (const key in formData) {
      formData[key] = ""
    }
    editeData.value = null
  }
  dialogVisible.value = true
}

//获取角色和部门列表
const importStore = useImportantStore()
importStore.postRolesListAction()
const { rolesList, departmentsList } = storeToRefs(importStore)

//确定表单
const systemSote = useSystemStore()
const handleConfirmBtnClick = () => {
  if (isUpdata.value && editeData.value) {
    // console.log(isUpdata.value, editeData.value)
    systemSote.updataUserListAction(formData, editeData.value.id)
  } else {
    importStore.creatUserDataAction(formData)
  }
  dialogVisible.value = false
}

//暴露给父组件的方法
defineExpose({ handleShowDialog })
</script>

<template>
  <div class="user-modal">
    <el-dialog v-model="dialogVisible" :title="isUpdata ? '编辑用户' : '新建用户'" width="500" center>
      <el-form :model="formData" label-width="80px">
        <el-form-item label="用户名" size="large" prop="name">
          <el-input v-model="formData.name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名" size="large" prop="realname">
          <el-input v-model="formData.realname" placeholder="请输入真实用户名" />
        </el-form-item>
        <el-form-item v-if="!isUpdata" label="密码" size="large" prop="password">
          <el-input v-model="formData.password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="电话号码" size="large" prop="cellphone">
          <el-input v-model="formData.cellphone" placeholder="请输入电话号码" />
        </el-form-item>

        <el-form-item label="选择角色" size="large" prop="role_id">
          <el-select placeholder="请选择角色" v-model="formData.role_id">
            <template v-for="item in rolesList" :key="item.id">
              <el-option :label="item.name" :value="item.id" />
            </template>
          </el-select>
        </el-form-item>

        <el-form-item label="选择部门" size="large" prop="department_id">
          <el-select placeholder="请选择部门" v-model="formData.department_id">
            <template v-for="item in departmentsList" :key="item.id">
              <el-option :label="item.name" :value="item.id" />
            </template>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleConfirmBtnClick"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped></style>
