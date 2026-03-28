import { creatUserData, postDepatments, postRolesList } from "@/servers/important/important";
import { defineStore, storeToRefs } from "pinia";

//自定义数据
import * as departmentsList from "@/fixtures/important/department/department-list.json"
import * as rolesList from '@/fixtures/important/role/role-list.json'
import * as userData from "@/fixtures/main/system/user-list.json"

import { useSystemStore } from "../main/system/system";

interface IImportant {
  rolesList: any[]
  departmentsList: any[]
}

const useImportantStore = defineStore('important', {
  state: (): IImportant => ({
    rolesList: [],
    departmentsList: []
  }),
  actions: {
    //获取角色列表和部门列表
    postRolesListAction() {
      // const rolesList = postRolesList()
      // const departments = postDepatments()
      // 模拟获取到数据
      this.rolesList = rolesList.data.list
      this.departmentsList = departmentsList.data.list
    },
    //创建数据
    creatUserDataAction(userInfo: any) {
      // const newUser = creatUserData(userInfo)
      // 模拟创建用户
      userData.data.list.unshift(userInfo)
      const systemStore = useSystemStore()
      systemStore.postUserListAction()
    }
  }
})

export default useImportantStore
