import xlRequest from "..";

export function postDepatments() {
  return xlRequest.post({
    url: "/users/list"
  })
}

export function postRolesList() {
  return xlRequest.post({
    url: "/users/list"
  })
}

export function creatUserData(userInfo: any) {
  return xlRequest.post({
    url: "/users",
    data: userInfo
  })
}

export function updataUsrInfoData(userInfo: any, id: number) {
  return xlRequest.patch({
    url: `/users/${id}`,
    data: userInfo
  })
}
