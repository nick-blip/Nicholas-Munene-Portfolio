import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Dashboard from './Dashboard'
import PredictStudent from './PredictStudent'
import BatchPredict from './BatchPredict'
import ModelMetrics from './ModelMetrics'
import DataManager from './DataManager'
import Settings from './Settings'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'predict', label: 'Predict Student', icon: '◎' },
  { id: 'batch', label: 'Batch Predict', icon: '⊞' },
  { id: 'metrics', label: 'Model Metrics', icon: '∿' },
  { id: 'data', label: 'Data Manager', icon: '⊟' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

const PAGES = { dashboard: Dashboard, predict: PredictStudent, batch: BatchPredict, metrics: ModelMetrics, data: DataManager, settings: Settings }

export default function Layout() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('dashboard')
  const Page = PAGES[tab]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: 'var(--surface)', borderRight: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '1rem 0', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '0.5px solid var(--border)', marginBottom: '0.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>AcadPredict</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>University Achievement Model</div>
        </div>
        <nav style={{ flex: 1, padding: '0 0.5rem' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 9, width: '100%',
              padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: 'none',
              textAlign: 'left', fontSize: 13.5, cursor: 'pointer', marginBottom: 2,
              background: tab === n.id ? 'var(--surface2)' : 'transparent',
              color: tab === n.id ? 'var(--text)' : 'var(--text2)',
              fontWeight: tab === n.id ? 500 : 400,
            }}>
              <span style={{ fontSize: 12, width: 16 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '0.75rem 1rem', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>{user?.username}</div>
          <button className="btn btn-sm" onClick={logout} style={{ width: '100%', justifyContent: 'center' }}>Sign out</button>
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', background: 'var(--bg)', minWidth: 0 }}>
        <Page onNavigate={setTab} />
      </main>
    </div>
  )
}
