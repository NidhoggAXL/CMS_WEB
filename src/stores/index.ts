import type { App } from "vue"
import { createPinia } from "pinia"
import useLoginStore from "./login/loginStore"

const pinia = createPinia()

function registerPinia(app: App<Element>) {
  //注册pinia插件
  app.use(pinia)
  //本地cache的加载和路由注册
  const loginStore = useLoginStore()
  loginStore.loadingCacheAction()
}

export default registerPinia
