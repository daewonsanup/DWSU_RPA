import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { MainMenu } from '@/types'

const STATIC_MENUS: MainMenu[] = [
  {
    id: 'hr', code: 'HR', name: '인사', icon: '👥', sortOrder: 1, isActive: true,
    subMenus: [
      { id: 'hr-emp', menuId: 'hr', code: 'HR001', name: '직원 목록',  routePath: '/hr/employees',  componentName: 'EmployeeList', sortOrder: 1, isActive: true },
      { id: 'hr-att', menuId: 'hr', code: 'HR002', name: '근태관리',    routePath: '/hr/attendance', componentName: 'Attendance',   sortOrder: 2, isActive: true },
      { id: 'hr-pay', menuId: 'hr', code: 'HR003', name: '급여관리',    routePath: '/hr/payroll',    componentName: 'Payroll',      sortOrder: 3, isActive: true },
    ],
  },
  {
    id: 'ga', code: 'GA', name: '총무', icon: '🏢', sortOrder: 2, isActive: true,
    subMenus: [
      { id: 'ga-asset', menuId: 'ga', code: 'GA001', name: '자산관리', routePath: '/ga/assets',     componentName: 'Assets',     sortOrder: 1, isActive: true },
      { id: 'ga-fac',   menuId: 'ga', code: 'GA002', name: '시설관리', routePath: '/ga/facilities', componentName: 'Facilities', sortOrder: 2, isActive: true },
    ],
  },
  {
    id: 'acc', code: 'ACC', name: '회계', icon: '📊', sortOrder: 3, isActive: true,
    subMenus: [
      { id: 'acc-book', menuId: 'acc', code: 'ACC001', name: '장부관리', routePath: '/acc/books',  componentName: 'Books',  sortOrder: 1, isActive: true },
      { id: 'acc-bud',  menuId: 'acc', code: 'ACC002', name: '예산관리', routePath: '/acc/budget', componentName: 'Budget', sortOrder: 2, isActive: true },
    ],
  },
  {
    id: 'prod', code: 'PROD', name: '생산', icon: '🏭', sortOrder: 4, isActive: true,
    subMenus: [
      { id: 'prod-wo', menuId: 'prod', code: 'PROD001', name: '작업지시', routePath: '/prod/workorders', componentName: 'WorkOrders', sortOrder: 1, isActive: true },
      { id: 'prod-qc', menuId: 'prod', code: 'PROD002', name: '품질관리', routePath: '/prod/quality',    componentName: 'Quality',    sortOrder: 2, isActive: true },
    ],
  },
]

interface Props {
  onNavigate?: (subMenuId: string) => void
}

export default function Sidebar({ onNavigate }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ hr: true })

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }))

  return (
    <aside className="w-60 bg-slate-900 flex flex-col flex-shrink-0 shadow-xl">
      <div className="px-5 py-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚙️</span>
          <div>
            <div className="text-white font-bold text-sm">DWSU Mini-ERP</div>
            <div className="text-slate-400 text-[10px]">On-Premise · :8585</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {STATIC_MENUS.map((menu) => {
          const isOpen = expanded[menu.id]
          const isActive = menu.subMenus.some((s) => location.pathname === s.routePath)
          return (
            <div key={menu.id}>
              <button
                onClick={() => toggle(menu.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                  ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <div className="flex items-center gap-2.5">
                  <span>{menu.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold leading-tight">{menu.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{menu.code}</div>
                  </div>
                </div>
                <span className={`text-slate-500 text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>▸</span>
              </button>

              {isOpen && (
                <div className="bg-slate-950/60">
                  {menu.subMenus.map((sub) => {
                    const isCurrent = location.pathname === sub.routePath
                    return (
                      <button
                        key={sub.id}
                        onClick={() => { navigate(sub.routePath); onNavigate?.(sub.id) }}
                        className={`w-full text-left pl-11 pr-4 py-2 text-[13px] transition-colors border-l-2
                          ${isCurrent
                            ? 'bg-blue-600 text-white font-semibold border-blue-400'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-transparent'
                          }`}
                      >
                        {sub.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/80">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">접속 포트</div>
        <div className="font-mono text-xs text-slate-300">:8585 (Web) · :15432 (DB)</div>
      </div>
    </aside>
  )
}
