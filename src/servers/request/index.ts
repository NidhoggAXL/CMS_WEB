import axios from "axios"
// import { BASE_URL, TIME_OUT } from './config/index'
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios"

interface MYIterceptors<T> {
  requestSucess?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
  requestError?: (err: any) => void
  responseSucess?: (res: T) => T
  responseError?: (err: any) => void
}

interface MYAxiosConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: MYIterceptors<T>
}

class MYAxios {
  instance: AxiosInstance
  constructor(config: MYAxiosConfig) {
    this.instance = axios.create(config)

    //全局请求拦截器，在请求发送之前做一些处理
    this.instance.interceptors.request.use(
      (config) => {
        // console.log("全局请求成功拦截")
        return config
      },
      (err) => {
        console.log("全局请求失败拦截")
        return err
      }
    )
    //全局响应拦截器，在响应返回之后做一些处理
    this.instance.interceptors.response.use(
      (res) => {
        // console.log("全局响应成功拦截")
        return res
      },
      (err) => {
        console.log("全局响应失败拦截")
        return err
      }
    )

    //创建实例的时候，在添加拦截器
    this.instance.interceptors.request.use(
      config.interceptors?.requestSucess,
      config.interceptors?.requestError
    )
    this.instance.interceptors.response.use(
      config.interceptors?.responseSucess,
      config.interceptors?.responseError
    )
  }

  request<T = any>(config: MYAxiosConfig<T>) {
    if (config.interceptors?.requestSucess) {
      config.interceptors?.requestSucess(config as InternalAxiosRequestConfig)
    }
    return new Promise<T>((resolve, reject) => {
      this.instance
        .request<any, T>(config)
        .then((res) => {
          if (config.interceptors?.responseSucess) {
            res = config.interceptors?.responseSucess(res)
          }
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  get<T = any>(config: MYAxiosConfig<T>) {
    return this.request({ ...config, method: "GET" })
  }
  post<T = any>(config: MYAxiosConfig<T>) {
    return this.request({ ...config, method: "POST" })
  }
  delete<T = any>(config: MYAxiosConfig<T>) {
    return this.request({ ...config, method: "DELETE" })
  }
  patch<T = any>(config: MYAxiosConfig<T>) {
    return this.request({ ...config, method: "PATCH" })
  }

}

export default MYAxios;
