import { deleteUserData, getQueryUserListData, postUserListData } from "@/servers/main/users"
import { deleteRoleData, getRolesListData, postRoleData, putRoleData } from "@/servers/main/roles"
import {
  deleteDepartmentData,
  getQueryDepartmentListData,
  getDepartmentListData,
  postDepartmentData,
  updateDepartmentData
} from "@/servers/main/department"
import { getMenuListData, deleteMenuData, postMenuData, updateMenuData } from "@/servers/main/menu"
import type {
  ISystemState,
  IUserList,
  IRoleList,
  IDepartmentList,
  IMenuItem
} from "@/types/main/system/system"
import { defineStore, storeToRefs } from "pinia"
import { ElMessage } from "element-plus"

import { updataUsrInfoData } from "@/servers/important/important"

//自定义一个模拟分页的函数
function PaginatedResult(userList: any[], page: number, pageSize: number) {
  // 确保页码和页大小是有效的
  const currentPage = Math.max(1, page)
  const currentPageSize = Math.max(1, pageSize)
  // 计算总页数
  const totalItems = userList.length

  // 计算起始和结束索引
  const startIndex = (currentPage - 1) * currentPageSize
  const endIndex = Math.min(startIndex + currentPageSize, totalItems)

  // 获取当前页的数据
  const paginatedData = userList.slice(startIndex, endIndex)
  return paginatedData
}

//自定义一个修改数据
function updataUserInfo(userInfo: any, id: number) {
  const systemStore = useSystemStore()
  const { userList } = storeToRefs(systemStore)
  userList.value.find((item: any) => {
    if (item.id === id) {
      for (const key in userInfo) {
        item[key] = userInfo[key]
      }
    }
  })
}

export const useSystemStore = defineStore("user", {
  state: (): ISystemState => ({
    userList: [],
    userTotalCount: 0,
    roleList: [],
    roleTotalCount: 0,
    departmentList: [],
    departmentTotalCount: 0,
    menuList: []
  }),
  actions: {
    // 获取角色列表数据
    async getRoleListAction(queryInfo = { page: 1, size: 10 }) {
      try {
        const allRoleData = await getRolesListData({
          offset: (queryInfo.page - 1) * queryInfo.size,
          size: queryInfo.size
        })
        this.roleList = allRoleData.data.data.list
        this.roleTotalCount = allRoleData.data.data.totalCount
      } catch (error) {
        console.error("获取角色数据失败:", error)
      }
    },

    // 删除角色
    async deleteRoleByIdAction(id: number) {
      try {
        await deleteRoleData(id)
        // 更新前端数据
        this.roleList = this.roleList.filter((item) => {
          return item.id !== id
        })
        // 更新总数
        this.roleTotalCount = this.roleTotalCount - 1
      } catch (error) {
        ElMessage.error("删除角色失败，请稍后重试")
      }
    },

    // 创建角色
    async createRoleAction(roleInfo: any) {
      // 这里只是模拟创建，实际项目中需要调用API
      const result = await postRoleData(roleInfo)
      if (result.status === 200) {
        ElMessage.success("创建成功")
        // 更新角色列表
        await this.getRoleListAction()
      } else {
        ElMessage.error("创建失败，请稍后重试")
      }
    },

    // 更新角色
    async updateRoleAction(roleInfo: any) {
      const result = await putRoleData(roleInfo)
      if (result.status === 200) {
        ElMessage.success("更新成功")
        // 更新角色列表
        await this.getRoleListAction()
      } else {
        ElMessage.error("更新失败，请稍后重试")
      }
    },

    // 获取部门列表数据
    async getDepartmentListAction(queryInfo = { page: 1, size: 10 }) {
      try {
        const offset = (queryInfo.page - 1) * queryInfo.size
        const pageInfo = { offset, size: queryInfo.size }

        const response = await getDepartmentListData(pageInfo)
        // 直接使用API返回的数据结构
        this.departmentList = response.data.data.list.map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          parent_id: dept.parent_id,
          leader: dept.leader,
          createAt: dept.create_at,
          updateAt: dept.update_at
        }))
        this.departmentTotalCount = response.data.data.totalCount
      } catch (error) {
        console.error("获取部门数据失败:", error)
      }
    },

    // 删除部门
    async deleteDepartmentByIdAction(id: number) {
      try {
        const response = await deleteDepartmentData(id)
        ElMessage.success("删除成功")
        // 更新前端数据
        this.departmentList = this.departmentList.filter((item) => {
          return item.id !== id
        })
        // 更新总数
        this.departmentTotalCount = this.departmentTotalCount - 1
      } catch (error) {
        ElMessage.error("删除部门失败，请稍后重试")
      }
    },

    // 创建部门
    async createDepartmentAction(departmentInfo: any) {
      try {
        const response = await postDepartmentData(departmentInfo)
        ElMessage.success("创建部门成功")
        return true
      } catch (error) {
        ElMessage.error("创建部门失败，请稍后重试")
        return false
      }
    },

    // 更新部门
    async updateDepartmentAction(departmentInfo: any) {
      try {
        const response = await updateDepartmentData(departmentInfo.id, departmentInfo)
        ElMessage.success("更新部门成功")
        return true
      } catch (error) {
        ElMessage.error("更新部门失败，请稍后重试")
        return false
      }
    },

    // 获取菜单列表数据
    async getMenuListAction() {
      try {
        const response = await getMenuListData({ offset: 0, size: 1000 }) // 获取所有菜单数据
        // console.log("Menu API Response:", response.data.data)
        this.menuList = response.data.data
      } catch (error) {
        console.error("获取菜单数据失败:", error)
      }
    },

    // 删除菜单
    async deleteMenuByIdAction(id: number) {
      try {
        const response = await deleteMenuData(id)
        ElMessage.success("删除成功")
        // 更新前端数据 - 从树形结构中删除节点
        this.menuList = this.removeMenuFromTree(this.menuList, id)
      } catch (error) {
        ElMessage.error("删除菜单失败，请稍后重试")
      }
    },

    // 从树形结构中删除菜单节点
    removeMenuFromTree(menuList: IMenuItem[], id: number): IMenuItem[] {
      return menuList
        .filter((item) => item.id !== id) // 过滤掉要删除的节点
        .map((item) => ({
          ...item,
          children: item.children ? this.removeMenuFromTree(item.children, id) : []
        })) // 递归处理子节点
    },

    // 创建菜单
    async createMenuAction(menuInfo: any) {
      try {
        const response = await postMenuData(menuInfo)
        ElMessage.success("创建菜单成功")
        return true
      } catch (error) {
        ElMessage.error("创建菜单失败，请稍后重试")
        return false
      }
    },

    // 更新菜单
    async updateMenuAction(menuInfo: any) {
      try {
        const response = await updateMenuData(menuInfo.id, menuInfo)
        ElMessage.success("更新菜单成功")
        return true
      } catch (error) {
        ElMessage.error("更新菜单失败，请稍后重试")
        return false
      }
    },
    //store异步数据获取
    async postUserListAction(queryInfo = { page: 1, size: 10 }, queryData?: any) {
      let allUserData: any
      if (queryData) {
        allUserData = await getQueryUserListData(queryData)
      } else {
        allUserData = await postUserListData({
          offset: (queryInfo.page - 1) * queryInfo.size,
          size: queryInfo.size
        })
      }
      this.userList = allUserData.data.data.list
      this.userTotalCount = allUserData.data.data.totalCount
    },
    //删除指定用户数据
    async deleteUserBayIdAction(id: number) {
      try {
        // 先尝试删除后端数据
        await deleteUserData(id)

        ElMessage.success("删除成功")
        // 成功后更新前端数据
        this.userList = this.userList.filter((item) => {
          return item.id !== id
        })
        // 更新总数
        this.userTotalCount = this.userTotalCount - 1
      } catch (error) {
        ElMessage.error("删除用户失败，请稍后重试")
      }
    },
    async updataUserListAction(userInfo: any, id: number) {
      const result = await updataUsrInfoData(userInfo, id)
      if (result.status === 200) {
        ElMessage.success("修改成功")
        // 更新前端数据
        await this.postUserListAction()
      } else {
        ElMessage.error("修改失败，请稍后重试")
      }
    }
  }
})
