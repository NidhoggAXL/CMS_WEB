<script setup lang="ts">
import { TOKEN } from "@/global/constant"
import useLoginStore from "@/stores/login/loginStore"
import { localCache } from "@/utils/cache"
import { useRouter } from "vue-router"

const router = useRouter()
//退出登录
function handleExitClick() {
  //删除最重要的token
  localCache.removeItem(TOKEN)
  router.push("/login")
}

const loginStore = useLoginStore()
const userName = loginStore.userInfo.name
</script>

<template>
  <div class="user">
    <div class="user-icon">
      <span class="icon"
        ><el-icon size="22px"><Message /></el-icon
      ></span>
      <span class="icon"
        ><el-icon size="22px"><ChatDotRound /></el-icon
      ></span>
      <span class="icon"
        ><el-icon size="22px"><Search /></el-icon
      ></span>
    </div>
    <div class="user-info">
      <el-dropdown>
        <div class="user-subinfo">
          <el-avatar
            :size="35"
            src="https://i.scdn.co/image/ab6765630000ba8adf19aa01ef09db934b6efda7"
          ></el-avatar>
          <div class="user-name text-ellipsis">{{ userName }}</div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item icon="CircleCloseFilled" @click="handleExitClick"
              >推出系统</el-dropdown-item
            >
            <el-dropdown-item icon="user">个人信息</el-dropdown-item>
            <el-dropdown-item icon="lock">修改密码</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="less" scoped>
.user {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .user-icon {
    display: flex;
    align-items: center;
    .icon {
      display: flex;
      margin-left: 10px;
      cursor: pointer;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    margin-left: 10px;
    cursor: pointer;

    .user-subinfo {
      display: flex;
      align-items: center;
      width: 130px;

      &:focus-visible {
        outline: none !important;
      }

      .user-name {
        margin-left: 5px;
        font-size: 16px;
      }
    }

    // 因为el-dropdown-menu_item在app结构之外
    // 要到全局寻找，所以需要用:global来修改
    :global(.el-dropdown-menu__item) {
      line-height: 36px !important;
      padding: 6px 22px;
    }
  }
}
</style>
