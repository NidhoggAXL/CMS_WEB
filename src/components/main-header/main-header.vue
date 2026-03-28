<script setup lang="ts">
import { computed, ref } from "vue"
import UserInfo from "./c-cpn/user-info.vue"
import { pathToBreadcrumb } from "@/utils/map-menu"
import { useRoute } from "vue-router"
import useLoginStore from "@/stores/login/loginStore"

// 定义要发送事件,是否折叠navmenu
const emits = defineEmits(["changeFold"])
function changeFoldClick() {
  isFold.value = !isFold.value
  emits("changeFold", isFold.value)
}

//记录折叠数据(默认不折叠)
const isFold = ref(false)

//面包屑导航匹配
const router = useRoute()
const login = useLoginStore()
const breadcrumb = computed(() => {
  return pathToBreadcrumb(router.path, login.userMenus)
})

</script>

<template>
  <div class="main-header">
    <div class="menu-icon" @click="changeFoldClick">
      <el-icon size="30px">
        <component :is="isFold ? 'expand' : 'fold'" />
      </el-icon>
    </div>
    <div class="content">
      <div class="crumb">
        <el-breadcrumb separator=">">
          <template v-for="item in breadcrumb" :key="item.id">
            <el-breadcrumb-item :to="item.path">{{ item.name }}</el-breadcrumb-item>
          </template>
        </el-breadcrumb>
      </div>
      <div class="info">
        <user-info />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.main-header {
  height: 100%;
  display: flex;
  align-items: center;

  .menu-icon {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
  }
}
</style>
