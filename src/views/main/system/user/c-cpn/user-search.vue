<script setup lang="ts">
import type { FormInstance } from "element-plus"
import { reactive, ref } from "vue"

//定义要发送事件
//重置事件
const emit = defineEmits(["reset-search", "query-search"])

//表单数据初始化
const searchForm = reactive({
  name: "",
  realname: "",
  cellphone: "",
  enable: 1,
  createAt: ""
})

//获取表单dom元素
const formRef = ref<FormInstance>()
//重置表单
function handleResetForm() {
  //element-plus提供的方法，重置表单
  formRef.value?.resetFields()
  emit("reset-search")
}
//查询数据
function handleQueryForm() {
  emit("query-search", searchForm)
}


</script>

<template>
  <div class="user-search">
    <el-form ref="formRef" :model="searchForm" size="large" label-width="80px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="用户名" prop="name">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入查询的用户民"
            /> </el-form-item
        ></el-col>
        <el-col :span="8">
          <el-form-item label="真实姓名" prop="realname">
            <el-input
              v-model="searchForm.realname"
              placeholder="请输入查询的真实姓名"
            /> </el-form-item
        ></el-col>
        <el-col :span="8">
          <el-form-item label="电话号码" :prop="searchForm.cellphone">
            <el-input
              v-model="searchForm.cellphone"
              placeholder="请输入查询的电话号码"
            /> </el-form-item
        ></el-col>
        <el-col :span="8">
          <el-form-item label="状态" prop="enable">
            <el-select v-model="searchForm.enable" placeholder="请选择查询状态">
              <el-option label="启用" :value="1" />
              <el-option label="禁止" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建时间" prop="createAt">
            <el-date-picker
              v-model="searchForm.createAt"
              type="daterange"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              size="large"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="btns">
      <el-button size="large" icon="Refresh" @click="handleResetForm"
        >重置</el-button
      >
      <el-button size="large" icon="Search" type="primary" @click="handleQueryForm">查询</el-button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.el-form {
  padding: 0 100px;
  border-radius: 5px;

  .el-row {
    margin-bottom: 20px;

    .el-form-item {
      padding-right: 40px;
    }
  }
}

.btns {
  text-align: right;
  padding-right: 50px;
}
</style>
