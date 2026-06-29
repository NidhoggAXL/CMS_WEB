export const TOKEN = "token"
export const USER_PERMISSIONS = "userPermissions"
export const ROLE_ID = "roleId"
export const SUPER_ADMIN_ROLE_ID = 1

export const PERMISSION = {
  SYSTEM_USER_VIEW: "system:user:view",
  SYSTEM_USER_CREATE: "system:user:create",
  SYSTEM_USER_UPDATE: "system:user:update",
  SYSTEM_USER_DELETE: "system:user:delete",

  SYSTEM_ROLE_VIEW: "system:role:view",
  SYSTEM_ROLE_CREATE: "system:role:create",
  SYSTEM_ROLE_UPDATE: "system:role:update",
  SYSTEM_ROLE_DELETE: "system:role:delete",
  SYSTEM_ROLE_ASSIGN: "system:role:assign",

  SYSTEM_MENU_VIEW: "system:menu:view",
  SYSTEM_MENU_CREATE: "system:menu:create",
  SYSTEM_MENU_UPDATE: "system:menu:update",
  SYSTEM_MENU_DELETE: "system:menu:delete",

  SYSTEM_DEPARTMENT_VIEW: "system:department:view",
  SYSTEM_DEPARTMENT_CREATE: "system:department:create",
  SYSTEM_DEPARTMENT_UPDATE: "system:department:update",
  SYSTEM_DEPARTMENT_DELETE: "system:department:delete",

  PRODUCT_CATEGORY_VIEW: "product:category:view",
  PRODUCT_CATEGORY_CREATE: "product:category:create",
  PRODUCT_CATEGORY_UPDATE: "product:category:update",
  PRODUCT_CATEGORY_DELETE: "product:category:delete",

  PRODUCT_GOODS_VIEW: "product:goods:view",
  PRODUCT_GOODS_CREATE: "product:goods:create",
  PRODUCT_GOODS_UPDATE: "product:goods:update",
  PRODUCT_GOODS_DELETE: "product:goods:delete",

  STORY_VIEW: "story:view",
  STORY_CREATE: "story:create",
  STORY_UPDATE: "story:update",
  STORY_DELETE: "story:delete",
} as const

export const PERMISSION_GROUPS = [
  {
    label: "用户管理",
    permissions: [
      { label: "查看", code: PERMISSION.SYSTEM_USER_VIEW },
      { label: "新建", code: PERMISSION.SYSTEM_USER_CREATE },
      { label: "编辑", code: PERMISSION.SYSTEM_USER_UPDATE },
      { label: "删除", code: PERMISSION.SYSTEM_USER_DELETE },
    ],
  },
  {
    label: "角色管理",
    permissions: [
      { label: "查看", code: PERMISSION.SYSTEM_ROLE_VIEW },
      { label: "新建", code: PERMISSION.SYSTEM_ROLE_CREATE },
      { label: "编辑", code: PERMISSION.SYSTEM_ROLE_UPDATE },
      { label: "删除", code: PERMISSION.SYSTEM_ROLE_DELETE },
      { label: "分配权限", code: PERMISSION.SYSTEM_ROLE_ASSIGN },
    ],
  },
  {
    label: "菜单管理",
    permissions: [
      { label: "查看", code: PERMISSION.SYSTEM_MENU_VIEW },
      { label: "新建", code: PERMISSION.SYSTEM_MENU_CREATE },
      { label: "编辑", code: PERMISSION.SYSTEM_MENU_UPDATE },
      { label: "删除", code: PERMISSION.SYSTEM_MENU_DELETE },
    ],
  },
  {
    label: "部门管理",
    permissions: [
      { label: "查看", code: PERMISSION.SYSTEM_DEPARTMENT_VIEW },
      { label: "新建", code: PERMISSION.SYSTEM_DEPARTMENT_CREATE },
      { label: "编辑", code: PERMISSION.SYSTEM_DEPARTMENT_UPDATE },
      { label: "删除", code: PERMISSION.SYSTEM_DEPARTMENT_DELETE },
    ],
  },
  {
    label: "商品分类",
    permissions: [
      { label: "查看", code: PERMISSION.PRODUCT_CATEGORY_VIEW },
      { label: "新建", code: PERMISSION.PRODUCT_CATEGORY_CREATE },
      { label: "编辑", code: PERMISSION.PRODUCT_CATEGORY_UPDATE },
      { label: "删除", code: PERMISSION.PRODUCT_CATEGORY_DELETE },
    ],
  },
  {
    label: "商品信息",
    permissions: [
      { label: "查看", code: PERMISSION.PRODUCT_GOODS_VIEW },
      { label: "新建", code: PERMISSION.PRODUCT_GOODS_CREATE },
      { label: "编辑", code: PERMISSION.PRODUCT_GOODS_UPDATE },
      { label: "删除", code: PERMISSION.PRODUCT_GOODS_DELETE },
    ],
  },
  {
    label: "故事模块",
    permissions: [
      { label: "查看", code: PERMISSION.STORY_VIEW },
      { label: "新建", code: PERMISSION.STORY_CREATE },
      { label: "编辑", code: PERMISSION.STORY_UPDATE },
      { label: "删除", code: PERMISSION.STORY_DELETE },
    ],
  },
]
