import router from "@/router"
import type { RouteRecordRaw } from "vue-router"

//保存本地所有路由对象
function loadingRoute() {
  //动态获取所有文件中的路由对象
  const localRoutes: RouteRecordRaw[] = []
  //获取router文件下面的所有ts文件，**是包括子文件
  const files: Record<string, any> = import.meta.glob("../router/main/**/*.ts", {
    eager: true
  })
  for (const key in files) {
    const module = files[key]
    localRoutes.push(module.default)
  }
  return localRoutes
}

//记录第一个注册的路由对象（全局对象方便导出）
export let firstMenu: any = null
export function menuToRoutes(userMenus: any[]) {
  //加载本地路由
  const localRoute = loadingRoute()
  //根据菜单匹配正确路由
  const routes: RouteRecordRaw[] = []
  for (const menu of userMenus) {
    // 确保菜单有子项才进行处理
    if (menu.children && Array.isArray(menu.children)) {
      for (const submenu of menu.children) {
        //本地路由对象的url和菜单的path匹配
        const route = localRoute.find((item) => item.path === submenu.url)
        if (route) {
          if (!routes.find((item) => item.path === menu.url)) {
            //顶层菜单添加重定向
            routes.push({ path: menu.url, redirect: route.path })
          }
          //添加匹配路由
          routes.push(route)
        }
        if (!firstMenu && route) {
          firstMenu = route
        }
      }
    }
  }
  return routes
}

/**
 * 根据路径匹配要显示的菜单
 * @param path 当前活跃路由的路径
 * @param userMenus 所有菜单
 */
export function pathToMenu(path: string, userMenus: any[]) {
  for (const menu of userMenus) {
    for (const submenu of menu.children) {
      if (submenu.url === path) {
        return submenu
      }
    }
  }
}

export function pathToBreadcrumb(path: string, userMenus: any[]) {
  const crumb: any[] = []
  for (const menu of userMenus) {
    for (const submenu of menu.children) {
      if (submenu.url === path) {
        //1.顶层菜单
        crumb.push({ name: menu.name, path: menu.url })
        //2.匹配菜单
        crumb.push({ name: submenu.name, path: submenu.url })
      }
    }
  }
  return crumb
}
