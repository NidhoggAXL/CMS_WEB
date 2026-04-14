import xlRequest from "../.."

//请求usrlist数据
export function postUserListData(queryInfo = { offset: 0, size: 10 }) {
  return xlRequest.get({
    url: "/users/list",
    params: queryInfo
  })
}

// 删除指定用户数据
export function deleteUserData(id: number) {
  return xlRequest.delete({
    url: `/users/${id}`
  })
}

export function getQueryUserListData(queryInfo: any) {
  return xlRequest.get({
    url: "/users/list/query",
    params: {
      ...queryInfo
    }
  })
}
