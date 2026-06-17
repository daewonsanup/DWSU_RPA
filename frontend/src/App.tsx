import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import client from '@/api/client'
import LoginPage from '@/pages/LoginPage'
import SetupWizardPage from '@/pages/SetupWizardPage'
import Layout from '@/components/layout/Layout'

type InitState = 'loading' | 'uninitialized' | 'ready'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center gap-3">
      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-slate-400 text-sm">시스템 상태 확인 중...</span>
    </div>
  )
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [initState, setInitState] = useState<InitState>('loading')

  useEffect(() => {
    client.get('/system/status')
      .then(res => setInitState(res.data.initialized ? 'ready' : 'uninitialized'))
      .catch(() => setInitState('ready'))  // If API unreachable, fall through to login
  }, [])

  if (initState === 'loading') return <LoadingScreen />

  if (initState === 'uninitialized') {
    return <SetupWizardPage onComplete={() => setInitState('ready')} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
