export interface IRoleList {
  id: number
  name: string
  enable: number
  createAt: string
  updateAt: string
}

export interface IUserList {
  id: number
  name: string
  realname: string
  cellphone: number
  enable: number
  departmentId: number
  roleId: number
  createAt: string
  updateAt: string
}

export interface IDepartmentList {
  id: number
  name: string
  parent_id: number
  leader: string
  createAt: string
  updateAt: string
}

export interface IMenuItem {
  id: number
  name: string
  type: number
  url?: string
  icon?: string
  sort?: number
  parent_id?: number
  create_at: string
  update_at: string
  children?: IMenuItem[]
}

export interface ITreeMenuItem {
  id: number
  label: string
  type: number
  url?: string
  icon?: string
  sort?: number
  parent_id?: number
  create_at: string
  update_at: string
  children?: ITreeMenuItem[]
}

export interface ISystemState {
  userList: IUserList[]
  userTotalCount: number
  roleList: IRoleList[]
  roleTotalCount: number
  departmentList: IDepartmentList[]
  departmentTotalCount: number
  menuList: IMenuItem[]
}
