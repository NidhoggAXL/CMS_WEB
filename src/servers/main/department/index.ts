import xlRequest from "../.."

// 请求部门列表数据
export function getDepartmentListData(queryInfo = { offset: 0, size: 10 }) {
  return xlRequest.get({
    url: "/departments/list",
    params: queryInfo
  })
}

// 删除指定部门数据
export function deleteDepartmentData(id: number) {
  return xlRequest.delete({
    url: `/departments/${id}`
  })
}

// 创建部门
export function postDepartmentData(departmentInfo: any) {
  return xlRequest.post({
    url: "/departments",
    data: departmentInfo
  })
}

// 更新部门
export function updateDepartmentData(id: number, departmentInfo: any) {
  return xlRequest.patch({
    url: `/departments/${id}`,
    data: departmentInfo
  })
}

export function getQueryDepartmentListData(queryInfo: any) {
  return xlRequest.get({
    url: "/departments/list/query",
    params: {
      ...queryInfo
    }
  })
}
