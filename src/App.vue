<script setup lang="ts">
import zhCn from "element-plus/es/locale/lang/zh-cn"
</script>

<template>
  <div class="App">
    <el-config-provider :locale="zhCn"><router-view /></el-config-provider>
  </div>
</template>

<style scoped lang="less">
.App {
  height: 100vh;
  width: 100vw;
}
</style>
