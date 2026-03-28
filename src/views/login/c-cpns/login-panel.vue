<script setup lang="ts">
import { ref, watch } from "vue"
import PaneAcount from "./pane-acount.vue"
import PanePhone from "./pane-phone.vue"
import { localCache } from "@/utils/cache"

const IS_KEEP = 'iskeep'

//记录复选框是否选中
const isKeep = ref<boolean>(localCache.getItem(IS_KEEP) ?? false)
//监听并保存复选框的是否选中(对用户习惯进行记录)
watch(isKeep, (newValue) => {
  localCache.setItem(IS_KEEP, newValue)
})

//记录tabs选中的内容
const activeName = ref("account")
//获取PanelAcout的组件实例
const acountRef = ref<InstanceType<typeof PaneAcount>>()


function handleLonginBtn() {
  if (activeName.value === "account") {
    //调用AcountRef里面的函数
    acountRef.value?.loginActive(isKeep.value)
  } else {
    console.log("手机好登录")
  }
}

</script>

<template>
  <div class="login-panel">
    <div class="cover">
      <h1 class="title">后台管理系统</h1>

      <!-- 中间tabs切换 -->
      <div class="tabs">
        <el-tabs v-model="activeName" type="border-card" stretch>
          <!-- 账号登录 -->
          <el-tab-pane label="账号登录" name="account">
            <template #label>
              <div class="label">
                <el-icon><User /></el-icon>
                <span class="text">账号登录</span>
              </div>
            </template>
            <template #default>
              <pane-acount ref="acountRef" />
            </template>
          </el-tab-pane>
          <!-- 手机登录 -->
          <el-tab-pane label="手机登录" name="phone">
            <template #label>
              <div class="label">
                <el-icon><Cellphone /></el-icon>
                <span class="text">手机登录</span>
              </div>
            </template>
            <template #default>
              <pane-phone />
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      <!-- 控制 -->
      <div class="control">
        <el-checkbox v-model="isKeep" label="记住密码" size="large" />
        <el-link type="primary">忘记密码</el-link>
      </div>
      <!-- 登录按钮 -->
      <el-button
        class="login-btn"
        type="primary"
        size="large"
        @click="handleLonginBtn"
        >立即登录</el-button
      >
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-panel {
  width: 330px;
  background-color: #fff;
  padding: 20px;

  .title {
    text-align: center;
    margin-bottom: 10px;
  }

  .tabs {
    .label {
      display: flex;
      align-items: center;
      .text {
        margin-left: 5px;
      }
    }

  }

  .control {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .login-btn {
    margin-top: 10px;
    width: 100%;
  }
}
</style>
