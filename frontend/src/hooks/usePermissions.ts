import { useAuthStore } from '@/store/authStore'
import type { Permission, ActionKey } from '@/types'

const DENY_ALL: Permission = {
  search: false, create: false, update: false,
  delete: false, print: false, export: false,
}

export function usePermissions(subMenuId: string): Permission {
  const perms = useAuthStore((s) => s.permissions)
  return perms[subMenuId] ?? DENY_ALL
}

export function useCanAction(subMenuId: string, action: ActionKey): boolean {
  return usePermissions(subMenuId)[action]
}
