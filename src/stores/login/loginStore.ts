import type { IAcount } from "@/types/login"
import { localCache } from "@/utils/cache"
import router from "@/router"
import { defineStore } from "pinia"
import { TOKEN } from "@/global/constant"
import { getUserInfoRequest, getUserMuneRequest, loginAcountRequest } from "@/servers/login/login"
//login登录模拟数据
import * as loginStore from "@/fixtures/login/login-store.json"

import * as authoritySuper from "@/fixtures/login/authority/login-authority-super.json"
import * as authorityAdmin from "@/fixtures/login/authority/login-autthority-admin.json"

import * as menuSuper from "@/fixtures/login/menus/login-menu-super.json"
import * as menuAdmin from "@/fixtures/login/menus/login-menu-admin.json"
import { menuToRoutes } from "@/utils/map-menu"

interface ILoginState {
  token: string
  userInfo: any
  userMenus: any[]
}

const useLoginStore = defineStore("login", {
  state: (): ILoginState => ({
    userInfo: {},
    token: "",
    userMenus: []
  }),
  actions: {
    async loginAccountAction(account: IAcount) {
      //1
      //coderwhy老师的服务器到期，所以自我模拟数据
      //帐号登录，获取token等信息
      // const loginResult = await loginAcountRequest(account)
      //模拟数据保存到login-store.json
      // 对模拟数据进行判断,进行不同帐号模拟登录
      this.token = loginStore.token
      const id = loginStore.id

      //2
      //进行本地缓存
      localCache.setItem(TOKEN, this.token)

      //3
      //根据登录账户的信息，获取角色等信息
      // const userInfoResult = await getUserInfoRequest(id)
      //模拟数据保存到login-authority-super.json和login-authority-admin.json
      if (account.name === "coderwhy") {
        this.userInfo = authoritySuper.data
        //本地缓存
        localCache.setItem("userInfo", authoritySuper.data)
      } else if (account.name === "coderdemo") {
        this.userInfo = authorityAdmin.data
        //本地缓存
        localCache.setItem("userInfo", authorityAdmin.data)
      }

      //4
      //根据角色请求用户的权限(莱单menus)
      //模拟两个用户角色
      // const userMenusResult = await getUserMuneRequest(id)
      //模拟数据保存到login-menum-super.json和login-menum-admin.json
      //对模拟数据进行判断
      if (this.userInfo.name === "coderwhy") {
        this.userMenus = menuSuper.data
        //本地缓存
        localCache.setItem("userMenus", menuSuper.data)
      } else if (this.userInfo.name === "coderdemo") {
        this.userMenus = menuAdmin.data
        //本地缓存
        localCache.setItem("userMenus", menuAdmin.data)
      }

      //5(重要)根据菜单动态添加路由
      const routes = menuToRoutes(this.userMenus)
      routes.forEach((route) => router.addRoute("main", route))

      //6
      //页面跳转到main
      router.push("/main")
    },
    loadingCacheAction() {
      //1.用户刷新加载数据
      const userInfo = localCache.getItem("userInfo")
      const token = localCache.getItem(TOKEN)
      const userMenus = localCache.getItem("userMenus")
      if (userInfo && token && userMenus) {
        this.userInfo = userInfo
        this.token = token
        this.userMenus = userMenus
        //5(重要)根据菜单动态添加路由
        const routes = menuToRoutes(this.userMenus)
        routes.forEach((route) => router.addRoute("main", route))
      }
    }
  }
})

export default useLoginStore
