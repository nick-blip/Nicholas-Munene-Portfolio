import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage({ onLogin }) {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      onLogin && onLogin()
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 500, fontSize: 18, marginBottom: 4 }}>Admin panel</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>Sign in to manage the chatbot</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Username</label>
            <input className="input" type="text" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div style={{ fontSize: 13, color: 'var(--red-text)', background: 'var(--red-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
