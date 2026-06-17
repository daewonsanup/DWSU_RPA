import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import ActionBar from './ActionBar'
import { usePermissions } from '@/hooks/usePermissions'
import type { ActionKey } from '@/types'
import EmployeeListPage from '@/pages/EmployeeListPage'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
      {title} 화면 — 준비 중
    </div>
  )
}

export default function Layout() {
  const [activeSubMenuId, setActiveSubMenuId] = useState('hr-emp')
  const permissions = usePermissions(activeSubMenuId)

  const handleAction = (key: ActionKey) => {
    console.log('[ActionBar]', key, activeSubMenuId)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar onNavigate={setActiveSubMenuId} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <ActionBar permissions={permissions} onAction={handleAction} />
        <main className="flex-1 overflow-y-auto p-5">
          <Routes>
            <Route path="/"                element={<EmployeeListPage subMenuId="hr-emp" />} />
            <Route path="/hr/employees"    element={<EmployeeListPage subMenuId="hr-emp" />} />
            <Route path="/hr/attendance"   element={<Placeholder title="근태관리" />} />
            <Route path="/hr/payroll"      element={<Placeholder title="급여관리" />} />
            <Route path="/ga/assets"       element={<Placeholder title="자산관리" />} />
            <Route path="/ga/facilities"   element={<Placeholder title="시설관리" />} />
            <Route path="/acc/books"       element={<Placeholder title="장부관리" />} />
            <Route path="/acc/budget"      element={<Placeholder title="예산관리" />} />
            <Route path="/prod/workorders" element={<Placeholder title="작업지시" />} />
            <Route path="/prod/quality"    element={<Placeholder title="품질관리" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
