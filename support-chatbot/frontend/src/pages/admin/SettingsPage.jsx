import { useState } from 'react'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'

export default function SettingsPage() {
  const { user } = useAuth()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleChange(e) {
    e.preventDefault()
    setStatus(null)
    if (newPw !== confirmPw) { setStatus({ error: 'New passwords do not match' }); return }
    if (newPw.length < 6) { setStatus({ error: 'New password must be at least 6 characters' }); return }
    setLoading(true)
    try {
      await api.changePassword(currentPw, newPw)
      setStatus({ success: 'Password updated successfully' })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      setStatus({ error: err.message || 'Failed to update password' })
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontWeight: 500, fontSize: 18 }}>Settings</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>Manage your admin account</p>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Account</div>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>Logged in as <strong>{user?.username}</strong></p>
      </div>

      <div className="card">
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>Change password</div>
        <form onSubmit={handleChange} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['Current password', currentPw, setCurrentPw],
            ['New password', newPw, setNewPw],
            ['Confirm new password', confirmPw, setConfirmPw],
          ].map(([label, value, setter]) => (
            <div key={label}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>{label}</label>
              <input className="input" type="password" value={value} onChange={e => setter(e.target.value)} required />
            </div>
          ))}
          {status?.error && <div style={{ fontSize: 13, color: 'var(--red-text)', background: 'var(--red-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>{status.error}</div>}
          {status?.success && <div style={{ fontSize: 13, color: 'var(--green-text)', background: 'var(--green-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>{status.success}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</button>
        </form>
      </div>
    </div>
  )
}
