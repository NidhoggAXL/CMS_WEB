import type { App, Directive } from "vue"
import { hasPermission } from "@/utils/permission"

const permissionDirective: Directive = {
  mounted(el, binding) {
    const value = binding.value
    if (!value) return

    const allowed = hasPermission(value)
    if (!allowed) {
      el.parentNode?.removeChild(el)
    }
  },
}

export function setupPermissionDirective(app: App) {
  app.directive("permission", permissionDirective)
}

export default permissionDirective
