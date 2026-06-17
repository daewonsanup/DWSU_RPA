import { useAuthStore } from '@/store/authStore'
import client from '@/api/client'

export default function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = async () => {
    try { await client.post('/auth/logout') } catch { /* ignore */ }
    logout()
    window.location.href = '/login'
  }

  return (
    <header className="h-12 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm flex-shrink-0">
      <div className="text-sm text-gray-500">
        DWSU Mini-ERP &nbsp;·&nbsp;
        <span className="font-mono text-xs text-gray-400">:8585</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">
          {user?.displayName}
          <span className="text-gray-400 text-xs ml-1">({user?.deptName})</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 px-2.5 py-1 rounded-md hover:border-red-200 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </header>
  )
}
