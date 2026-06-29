import { createApp } from "vue"
//引入自定义插件
import RegisterIcons from '@/global/register-icons'
import { setupPermissionDirective } from "@/directives/permission"


import "normalize.css"
import "./styles/index.less"

import router from "./router/index"
import App from "./App.vue"
import registerPinia from "./stores"

const app = createApp(App)
app.use(RegisterIcons)
setupPermissionDirective(app)
app.use(registerPinia)
app.use(router)
app.mount("#app")
