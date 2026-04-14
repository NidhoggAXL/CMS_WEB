import type { IAcount } from "@/types/login"
import xlRequest from ".."



//帐号密码登录
export function loginAcountRequest(acount: IAcount) {
  return xlRequest.post({
    url: "/login",
    data: acount
  })
}

//登录获取权限信息
export function getUserInfoRequest(id: number) {
  return xlRequest.get({
    url: `/login/role/${id}`
  })
}

//获取权限对应的菜单
export function getUserMuneRequest(id: number) {
  return xlRequest.get({
    url: `login/role/${id}/menus`
  })
}
