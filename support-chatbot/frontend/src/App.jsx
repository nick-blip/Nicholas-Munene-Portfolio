import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import ChatPage from './pages/ChatPage'
import LoginPage from './pages/LoginPage'
import AdminLayout from './pages/AdminLayout'
import './index.css'

function AppRoutes() {
  const { user, loading } = useAuth()
  const [route, setRoute] = useState(window.location.hash || '#/')

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text3)', fontSize: 14 }}>Loading…</div>

  if (route.startsWith('#/admin')) {
    if (!user) return <LoginPage onLogin={() => { window.location.hash = '#/admin' }} />
    return <AdminLayout />
  }

  return (
    <div>
      <ChatPage />
      <div style={{ position: 'fixed', bottom: 16, right: 16 }}>
        <a href="#/admin" style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none', padding: '5px 10px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>Admin</a>
      </div>
    </div>
  )
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}
