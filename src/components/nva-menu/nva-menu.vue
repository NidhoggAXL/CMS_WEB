<script setup lang="ts">
import useLoginStore from "@/stores/login/loginStore"
import { pathToMenu } from "@/utils/map-menu"
import { ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

const loginStore = useLoginStore()

defineProps({
  isFold: {
    type: Boolean,
    default: false
  }
})

//点击路由的切换
const router = useRouter()
function handleRouterClick(routerUrl:string) {
  router.push(routerUrl)
}

//动态根据路由路径匹配菜单
const route = useRoute()
// 监听路由变化获取id匹配index
const defaultActive = ref("")
watch(
  () => route.path,
  (newPath) => {
    const pathMenu = pathToMenu(newPath, loginStore.userMenus)
    defaultActive.value = pathMenu.id + ''
  },
  { immediate: true }
)

</script>

<template>
  <div class="nav-menu">
    <!-- logo -->
    <div class="logo" >
      <img src="../../assets//imgs//logo.svg" class="img" />
      <span v-show="!isFold" class="title">后台管理系统</span>
    </div>

    <!-- 菜单 -->
    <div class="menu">
      <el-menu
        text-color="#b7bdc3"
        active-text-color="#fff"
        background-color="#001529"
        :default-active="defaultActive"
        :collapse="isFold"
        unique-opened
      >
        <template v-for="item in loginStore.userMenus" :key="item.id">
          <el-sub-menu :index="(item.id + '')">
            <template #title>
              <!-- 服务器类似放回 el-icon-location 的字符串 -->
              <el-icon size="20">
                <component :is="item.icon.split('-icon-')[1]" />
              </el-icon>
              <span class="title">{{ item.name}}</span>
            </template>

            <template v-for="subitem in item.children" :key="subitem.id">
              <el-menu-item :index="(subitem.id + '')" @click="handleRouterClick(subitem.url)">{{ subitem.name }}</el-menu-item>
            </template>
          </el-sub-menu>
        </template>
      </el-menu>
    </div>
  </div>
</template>

<style lang="less" scoped>
.nav-menu {
  height: 100%;
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  height: 70px;

  .img {
    width: 35px;
    height: 35px;
    margin-left: 8px;
  }
  .title {
    margin-left: 20px;
    font-size: 16px;
    font-weight: 700;
  }
}

.el-menu {
  border-right: none;
  user-select: none;
}

.el-sub-menu {
  .el-menu-item {
    padding-left: 50px !important;
    background-color: #0c2135;
  }

  .el-menu-item:hover {
    color: #fff;
  }

  .el-menu-item.is-active {
    background-color: #0a60bd;
  }
}
</style>
