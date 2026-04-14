import xlRequest from "../.."

//请求角色列表数据
export function getRolesListData(queryInfo = { offset: 0, size: 10 }) {
  return xlRequest.get({
    url: "/roles/list",
    params: queryInfo
  })
}

// postRoleData 创建角色
export function postRoleData(roleInfo: any) {
  return xlRequest.post({
    url: "/roles",
    data: roleInfo
  })
}

// 删除指定角色数据
export function deleteRoleData(id: number) {
  return xlRequest.delete({
    url: `/roles/${id}`
  })
}

// 更新角色
export function putRoleData(roleInfo: any) {
  return xlRequest.patch({
    url: `/roles/${roleInfo.id}`,
    data: roleInfo
  })
}
