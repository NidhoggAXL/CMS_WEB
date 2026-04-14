import xlRequest from "../.."

//请求菜单列表数据
export function getMenuListData(queryInfo = { offset: 0, size: 10 }) {
  return xlRequest.get({
    url: "/menus/list"
  })
}

// 删除指定菜单数据
export function deleteMenuData(id: number) {
  return xlRequest.delete({
    url: `/menus/delete/${id}`
  })
}

// 创建菜单
export function postMenuData(menuInfo: any) {
  return xlRequest.post({
    url: "/menus/create",
    data: menuInfo
  })
}

// 更新菜单
export function updateMenuData(id: number, menuInfo: any) {
  return xlRequest.patch({
    url: `/menus/update/${id}`,
    data: menuInfo
  })
}
