import { localCache } from "@/utils/cache"
import { BASE_URL, TIME_OUT } from "./config"
import MYAxios from "./request"
import { TOKEN } from "@/global/constant"

const xlRequest = new MYAxios({
  baseURL: BASE_URL,
  timeout: TIME_OUT,
  //在创建实例的时候，添加路由守卫钩子
  //对 config 进行配置，并返回
  //以返回的配置，真正请求
  interceptors: {
    requestSucess: (config) => {
      const token = localCache.getItem(TOKEN)
      if (config.headers && token)
        //类型缩小
        config.headers.Authorization = "Bearer " + localCache.getItem(TOKEN)
      return config
    },
    responseSucess: (res) => {
      if (res.data?.code === -2001) {
        ElMessage.error(res.data.message || "权限不足，请联系管理员！")
      }
      return res
    }
  }
})

export default xlRequest
