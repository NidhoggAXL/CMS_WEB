import xlRequest from "../.."

export function getPermissionsListData() {
  return xlRequest.get({
    url: "/permissions/list",
  })
}

export function getRolePermissionsData(roleId: number) {
  return xlRequest.get({
    url: `/permissions/role/${roleId}`,
  })
}

export function updateRolePermissionsData(roleId: number, permissionIds: number[]) {
  return xlRequest.put({
    url: `/permissions/role/${roleId}`,
    data: { permissionIds },
  })
}
