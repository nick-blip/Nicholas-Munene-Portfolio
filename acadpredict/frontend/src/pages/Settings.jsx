import { useState } from 'react'
import { api } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

export default function Settings() {
  const { user } = useAuth()
  const [cur, setCur] = useState(''); const [nw, setNw] = useState(''); const [conf, setConf] = useState('')
  const [status, setStatus] = useState(null); const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault(); setStatus(null)
    if (nw !== conf) { setStatus({ error: 'New passwords do not match' }); return }
    if (nw.length < 6) { setStatus({ error: 'New password must be at least 6 characters' }); return }
    setLoading(true)
    try { await api.changePw(cur, nw); setStatus({ success: 'Password updated' }); setCur(''); setNw(''); setConf('') }
    catch (e) { setStatus({ error: e.message }) }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 460 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">Settings</div>
        <div className="section-sub">Manage your admin account</div>
      </div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>Account</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>Logged in as <strong>{user?.username}</strong></div>
      </div>
      <div className="card">
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>Change password</div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['Current password', cur, setCur], ['New password', nw, setNw], ['Confirm new password', conf, setConf]].map(([label, val, setter]) => (
            <div key={label} className="form-group">
              <label className="form-label">{label}</label>
              <input className="input" type="password" value={val} onChange={e => setter(e.target.value)} required />
            </div>
          ))}
          {status?.error && <div className="alert alert-error">{status.error}</div>}
          {status?.success && <div className="alert alert-success">{status.success}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</button>
        </form>
      </div>
    </div>
  )
}
