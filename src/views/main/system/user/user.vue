<script setup lang="ts">
import { ref } from "vue"
import UserContent from "./c-cpn/user-content.vue"
import UserSearch from "./c-cpn/user-search.vue"
import UserModal from "./c-cpn/user-modal.vue"

//获取组件dom元素
const userContentRef = ref<InstanceType<typeof UserContent>>()
//重置搜索
const handleRestSearch = () => {
  //默认调用fetchUserData，按照默认参数重新获取数据
  userContentRef.value?.fetchUserData()
}
//根据表单进行搜索
const handleQuerySearch = (queryData: any) => {
  //调用fetchUserData，按照表单参数重新获取数据
  userContentRef.value?.fetchUserData(queryData)
}

//新建用户点击逻辑
const modalRef = ref<InstanceType<typeof UserModal>>()
function handleNewUser() {
  modalRef.value?.handleShowDialog()
}
//更新用户点击逻辑
function handleUpdataUserData(userInfo: any) {
  modalRef.value?.handleShowDialog(true, userInfo)
}
</script>

<template>
  <div class="user">
    <user-search @reset-search="handleRestSearch" @query-search="handleQuerySearch"/>
    <user-content ref="userContentRef" @new-user="handleNewUser" @updata-user="handleUpdataUserData"/>
    <user-modal ref="modalRef"/>
  </div>
</template>

<style lang="less" scoped>

</style>
