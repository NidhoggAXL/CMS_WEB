import type { IAcount } from "@/types/login"
import { localCache } from "@/utils/cache"
import router from "@/router"
import { defineStore } from "pinia"
import { TOKEN } from "@/global/constant"
import {
  getUserInfoRequest,
  getUserMuneRequest,
  getUserPermissionsRequest,
  loginAcountRequest
} from "@/servers/login/login"
import { menuToRoutes } from "@/utils/map-menu"
import { setPermissionCache } from "@/utils/permission"

interface ILoginState {
  token: string
  userInfo: any
  userMenus: any[]
  userPermissions: string[]
  roleId: number | null
}

const useLoginStore = defineStore("login", {
  state: (): ILoginState => ({
    userInfo: {},
    token: "",
    userMenus: [],
    userPermissions: [],
    roleId: null
  }),
  getters: {
    hasPermission: (state) => {
      return (code: string | string[]) => {
        if (state.roleId === 1) return true
        if (Array.isArray(code)) {
          return code.some((item) => state.userPermissions.includes(item))
        }
        return state.userPermissions.includes(code)
      }
    }
  },
  actions: {
    savePermissions(roleId: number, permissions: string[] = []) {
      this.roleId = roleId
      this.userPermissions = permissions
      setPermissionCache(roleId, permissions)
    },
    async loadPermissions(roleId: number, fallbackPermissions?: string[]) {
      if (fallbackPermissions?.length) {
        this.savePermissions(roleId, fallbackPermissions)
        return
      }

      const permissionsResult = await getUserPermissionsRequest(roleId)
      const permissionCodes = permissionsResult.data.data?.permissionCodes || []
      this.savePermissions(roleId, permissionCodes)
    },
    async loginAccountAction(account: IAcount) {
      const loginResult = await loginAcountRequest(account)
      if (loginResult.data.code === -1003) {
        ElMessage.error(loginResult.data.message)
        return
      } else if (loginResult.data.code === -1004) {
        ElMessage.error(loginResult.data.message)
        return
      }
      const token = loginResult.data.data.token
      const user = loginResult.data.data.user
      const loginPermissions = loginResult.data.data.permissions || []
      this.token = token

      localCache.setItem(TOKEN, this.token)

      const userInfoResult = await getUserInfoRequest(user.role_id)
      this.userInfo = userInfoResult.data.data
      localCache.setItem("userInfo", this.userInfo)

      const userMenusResult = await getUserMuneRequest(user.role_id)
      this.userMenus = userMenusResult.data.data
      localCache.setItem("userMenus", this.userMenus)

      await this.loadPermissions(user.role_id, loginPermissions)

      const routes = menuToRoutes(this.userMenus)
      routes.forEach((route) => router.addRoute("main", route))

      router.push("/main")
    },
    async loadingCacheAction() {
      const userInfo = localCache.getItem("userInfo")
      const token = localCache.getItem(TOKEN)
      const userMenus = localCache.getItem("userMenus")
      if (userInfo && token && userMenus) {
        this.userInfo = userInfo
        this.token = token
        this.userMenus = userMenus
        const routes = menuToRoutes(this.userMenus)
        routes.forEach((route) => router.addRoute("main", route))
        await this.loadPermissions(userInfo.id)
      }
    }
  }
})

export default useLoginStore
