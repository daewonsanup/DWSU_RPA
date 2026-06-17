export type ActionKey = 'search' | 'create' | 'update' | 'delete' | 'print' | 'export'

export interface Permission {
  search: boolean
  create: boolean
  update: boolean
  delete: boolean
  print: boolean
  export: boolean
}

export interface SubMenu {
  id: string
  menuId: string
  code: string
  name: string
  routePath: string
  componentName: string
  sortOrder: number
  isActive: boolean
}

export interface MainMenu {
  id: string
  code: string
  name: string
  icon: string
  sortOrder: number
  isActive: boolean
  subMenus: SubMenu[]
}

export interface User {
  id: string
  username: string
  displayName: string
  email: string
  deptId: string
  deptName: string
  isSystemAdmin: boolean
  isActive: boolean
}
