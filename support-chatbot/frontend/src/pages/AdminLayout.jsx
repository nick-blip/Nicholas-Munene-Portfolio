import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import KBPage from './admin/KBPage'
import NLPLogPage from './admin/NLPLogPage'
import AnalyticsPage from './admin/AnalyticsPage'
import SettingsPage from './admin/SettingsPage'

const NAV = [
  { id: 'analytics', label: 'Analytics', icon: '▦' },
  { id: 'kb', label: 'Knowledge base', icon: '⊞' },
  { id: 'nlp', label: 'NLP review', icon: '⚑' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('analytics')

  const pages = { analytics: AnalyticsPage, kb: KBPage, nlp: NLPLogPage, settings: SettingsPage }
  const Page = pages[tab]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: 'var(--surface)', borderRight: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '1rem 0', flexShrink: 0 }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '0.5px solid var(--border)', marginBottom: '0.5rem' }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>Support Chatbot</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Admin panel</div>
        </div>
        <nav style={{ flex: 1, padding: '0 0.5rem' }}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px',
                borderRadius: 'var(--radius-sm)', border: 'none', textAlign: 'left', fontSize: 14,
                background: tab === n.id ? 'var(--surface2)' : 'transparent',
                color: tab === n.id ? 'var(--text)' : 'var(--text2)',
                fontWeight: tab === n.id ? 500 : 400,
                cursor: 'pointer', marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 13 }}>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '0.75rem 1rem', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{user?.username}</div>
          <button className="btn btn-sm" onClick={logout} style={{ width: '100%', justifyContent: 'center' }}>Sign out</button>
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg)' }}>
        <Page />
      </main>
    </div>
  )
}
