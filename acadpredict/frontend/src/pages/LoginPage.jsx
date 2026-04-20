import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const [u, setU] = useState(''); const [p, setP] = useState('')
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)
  async function submit(e) {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await login(u, p); window.location.hash = '#/dashboard' }
    catch (e) { setErr(e.message) }
    setLoading(false)
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: 360 }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 2 }}>AcadPredict</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>Academic achievement prediction system</div>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group"><label className="form-label">Username</label><input className="input" value={u} onChange={e => setU(e.target.value)} required autoFocus /></div>
          <div className="form-group"><label className="form-label">Password</label><input className="input" type="password" value={p} onChange={e => setP(e.target.value)} required /></div>
          {err && <div className="alert alert-error">{err}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
