<script setup lang="ts">
import useLoginStore from "@/stores/login/loginStore"
import type { IAcount } from "@/types/login"
import { localCache } from "@/utils/cache"
import { ElMessage, type FormInstance, type FormRules } from "element-plus"
import { reactive, ref } from "vue"

const USER_NAME = "username"
const PASSWORD = "password"
const DEMO_ACCOUNT = "coderaxl"
const DEMO_PASSWORD = "123456"

//定义表单数据
const acountFrom = reactive<IAcount>({
  name: localCache.getItem(USER_NAME) ?? DEMO_ACCOUNT,
  password: localCache.getItem(PASSWORD) ?? DEMO_PASSWORD
})

//定义规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: "请输入你的姓名", trigger: "blur" },
    {
      min: 6,
      max: 15,
      message: "输入的长度为6到15",
      trigger: ["change", "blur"]
    }
  ],
  password: [
    { required: true, message: "请输入你的密码", trigger: "blur" },
    {
      min: 6,
      max: 15,
      message: "输入的长度为6到15",
      trigger: ["change", "blur"]
    }
  ]
})

// 表单验证
const formRef = ref<FormInstance>()
// const formRef = ref<InstanceType<typeof ElForm> | null>(null);
// 登录url返回的信心保存到store
const loginStore = useLoginStore()
function loginActive(isKeep: boolean) {
  //帐号和密码的校验
  formRef.value?.validate((valid) => {
    if (valid) {
      // 登录逻辑
      const name = acountFrom.name
      const password = acountFrom.password
      //向服务器发送网路请求（携带帐号和密码）
      loginStore.loginAccountAction({ name, password }).then(() => {
        //登录成功后复选框选定记住密码，本地保存账户和密码
        if (isKeep) {
          localCache.setItem(USER_NAME, name)
          localCache.setItem(PASSWORD, password)
        } else {
          localCache.removeItem(USER_NAME)
          localCache.removeItem(PASSWORD)
        }
      })
    } else {
      ElMessage.error("请按要求输入正确的帐号和密码")
    }
  })
}

defineExpose({
  loginActive
})
</script>

<template>
  <div class="pane-acount">
    <el-form :model="acountFrom" :rules="rules" ref="formRef" label-width="60px">
      <el-form-item label="帐号" prop="name">
        <el-input v-model="acountFrom.name" :placeholder="DEMO_ACCOUNT" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="acountFrom.password"
          :placeholder="DEMO_PASSWORD"
          show-password
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="less" scoped></style>
