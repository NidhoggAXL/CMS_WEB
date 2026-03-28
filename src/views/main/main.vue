<script setup lang="ts">
import MainHeader from "@/components/main-header/main-header.vue"
import NvaMenu from "@/components/nva-menu/nva-menu.vue"
import { ref } from "vue"

//记录子组件main-header是否折叠
const isFold = ref()
function handleFold(fold: boolean) {
  isFold.value = fold
}

// import { TOKEN } from '@/global/constant';
// import router from '@/router';
// import { localCache } from '@/utils/cache';

// function handleExitClick() {
//   //清除token
//   localCache.removeItem(TOKEN)
//   //跳转到登录页面
//   router.push("/login")
// }
</script>

<template>
  <div class="main">
    <el-container class="main-container">
      <el-aside :width="isFold ? '60px' : '210px'">
        <nva-menu :is-fold="isFold" />
      </el-aside>
      <el-container>
        <el-header>
          <main-header @change-fold="handleFold" />
        </el-header>
        <el-main class="hide-scrollbar">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="less" scoped>
.main {
  height: 100%;
}

.main-container {
  height: 100%;

  .el-header {
    text-align: center;
    line-height: 60px;
  }

  .el-aside {
    background-color: #001529;
    color: #333;
    text-align: center;
    line-height: 200px;
  }

  .el-main {
    margin: 0 10px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }

  .el-aside {
    overflow-x: hidden;
    overflow-y: auto;
    line-height: 200px;
    text-align: left;
    cursor: pointer;
    scrollbar-width: none; /* firefox */
    -ms-overflow-style: none; /* IE 10+ */

    transition: width 0.3s ease;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
