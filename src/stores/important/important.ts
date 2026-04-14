import { creatUserData, postDepatments, postRolesList } from "@/servers/important/important"
import { defineStore, storeToRefs } from "pinia"
import { ElMessage } from "element-plus"

import { useSystemStore } from "../main/system/system"
import { getRolesListData } from "@/servers/main/roles"
import { getDepartmentListData } from "@/servers/main/department"

interface IImportant {
  rolesList: any[]
  rolesListCount: number
  departmentsList: any[]
  departmentsListCount: number
}

const useImportantStore = defineStore("important", {
  state: (): IImportant => ({
    rolesList: [],
    departmentsList: [],
    rolesListCount: 0,
    departmentsListCount: 0
  }),
  actions: {
    //获取角色列表和部门列表
    async postRolesListAction() {
      const rolesList = await getRolesListData()
      const departmentsList = await getDepartmentListData()
      this.rolesList = rolesList.data.data.list
      this.rolesListCount = rolesList.data.data.totalCount
      this.departmentsList = departmentsList.data.data.list
      this.departmentsListCount = departmentsList.data.data.totalCount
      // 模拟获取到数据
    },
    //创建数据
    async creatUserDataAction(userInfo: any) {
      const newUser = await creatUserData(userInfo)
      if (newUser.status === 200) {
        ElMessage.success("创建成功")
      } else {
        ElMessage.error("创建失败，请稍后重试")
      }
      // 模拟创建用户
      // userData.data.list.unshift(userInfo)
      // const systemStore = useSystemStore()
      // systemStore.postUserListAction()
    }
  }
})

export default useImportantStore
