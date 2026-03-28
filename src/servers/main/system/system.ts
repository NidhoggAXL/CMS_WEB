import xlRequest from "../.."

//请求usrlist数据
export function postUserListData(queryInfo = { offset: 0, size: 10 }) {
  return xlRequest.post({
    url: "/user/list",
    data: queryInfo
  })
}

export function deleteUserData(id: number) {
  return xlRequest.delete({
    url: `/user/${id}`
  })
}
