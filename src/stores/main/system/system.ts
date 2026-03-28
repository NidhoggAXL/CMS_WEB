import { deleteUserData, postUserListData } from "@/servers/main/system/system"
import type { ISystemState } from "@/types/main/system/system"
import { defineStore, storeToRefs } from "pinia"

//自定义数据
import * as userData from "@/fixtures/main/system/user-list.json"
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
      for ( const key in userInfo) {
        item[key] = userInfo[key]
      }
    }
  })
}

export const useSystemStore = defineStore("user", {
  state: (): ISystemState => ({
    userList: userData.data.list,
    userTotalCount: 0
  }),
  actions: {
    //store异步数据
    async postUserListAction(queryInfo = { page: 1, size: 10 }) {
      // const userData = await postUserListData()
      //使用自定义数据模拟分页操作
      const paginatedData = PaginatedResult(userData.data.list, queryInfo.page, queryInfo.size)
      this.userList = paginatedData
      this.userTotalCount = userData.data.list.length
    },
    //删除指定用户数据
    async deleteUserBayIdAction(id: number) {
      // const res = await deleteUserData(id)
      // 使用自定义删除数据
      this.userList = this.userList.filter((item) => {
        return item.id !== id
      })
    },
    updataUserListAction(userInfo: any, id: number) {
      // updataUsrInfoData(userInfo, id)
      // 模拟编辑修改数据
      updataUserInfo(userInfo, id)
    }
  }
})
