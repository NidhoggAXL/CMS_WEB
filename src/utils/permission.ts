import { localCache } from "@/utils/cache"
import { ROLE_ID, SUPER_ADMIN_ROLE_ID, USER_PERMISSIONS } from "@/global/constant"

export function getUserPermissions(): string[] {
  return localCache.getItem(USER_PERMISSIONS) || []
}

export function getRoleId(): number | null {
  const roleId = localCache.getItem(ROLE_ID)
  return roleId === null || roleId === undefined ? null : Number(roleId)
}

export function hasPermission(code: string | string[]): boolean {
  const roleId = getRoleId()
  if (roleId === SUPER_ADMIN_ROLE_ID) return true

  const permissions = getUserPermissions()
  if (Array.isArray(code)) {
    return code.some((item) => permissions.includes(item))
  }
  return permissions.includes(code)
}

export function setPermissionCache(roleId: number, permissions: string[]) {
  localCache.setItem(ROLE_ID, roleId)
  localCache.setItem(USER_PERMISSIONS, permissions)
}

export function clearPermissionCache() {
  localCache.removeItem(ROLE_ID)
  localCache.removeItem(USER_PERMISSIONS)
}
