import { TOKEN } from "@/global/constant"
import { localCache } from "@/utils/cache"
import { firstMenu } from "@/utils/map-menu"
import { createRouter, createWebHashHistory } from "vue-router"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: "/main"
    },
    {
      path: "/main",
      name: "main",
      component: () => import("@/views/main/main.vue")
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/login/login.vue")
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/ui/NotFount/NotFount.vue")
    }
  ]
})


router.beforeEach((to) => {
  const token = localCache.getItem(TOKEN)
  //只要是以main开头的都需要对token进行检测
  if (to.path.startsWith("/main") && !token) {
    return "/login"
  }

  //如果存在token重定向到匹配的第一个路由
  if (to.path === "/main") {
    return firstMenu?.path
  }
})


export default router
