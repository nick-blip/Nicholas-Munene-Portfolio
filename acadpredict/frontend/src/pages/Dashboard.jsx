import { useState, useEffect } from 'react'
import { api } from '../utils/api'

function MiniBar({ value, max, color }) {
  return (
    <div className="bar-track" style={{ flex: 1 }}>
      <div className="bar-fill" style={{ width: `${max > 0 ? Math.round(value / max * 100) : 0}%`, background: color }} />
    </div>
  )
}

export default function Dashboard({ onNavigate }) {
  const [analytics, setAnalytics] = useState(null)
  const [status, setStatus] = useState(null)
  const [studentCount, setStudentCount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getAnalytics(), api.modelStatus(), api.countStudents()])
      .then(([a, s, c]) => { setAnalytics(a); setStatus(s); setStudentCount(c.count) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading dashboard…</div>

  const gradeDist = analytics?.grade_distribution || {}
  const gradeColors = { A: '#3B6D11', B: '#185FA5', C: '#BA7517', D: '#888', F: '#A32D2D' }
  const maxGrade = Math.max(...Object.values(gradeDist), 1)

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">Dashboard</div>
        <div className="section-sub">Overview of predictions and model health</div>
      </div>

      {!status?.ready && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          Models not trained yet. Go to <button onClick={() => onNavigate('metrics')} style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 500, padding: 0, textDecoration: 'underline' }}>Model Metrics</button> and click Train to get started.
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 16 }}>
        {[
          ['Total predictions', analytics?.total_predictions ?? 0, 'var(--text)'],
          ['Pass rate', analytics?.total_predictions ? `${analytics.pass_rate}%` : '—', 'var(--green)'],
          ['At-risk rate', analytics?.total_predictions ? `${analytics.at_risk_rate}%` : '—', 'var(--amber)'],
          ['Avg predicted GPA', analytics?.avg_predicted_gpa ?? '—', 'var(--purple)'],
        ].map(([label, val, color]) => (
          <div key={label} className="metric-card">
            <div className="metric-label">{label}</div>
            <div className="metric-value" style={{ color }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>Grade distribution</div>
          {Object.keys(gradeDist).length === 0
            ? <div style={{ fontSize: 13, color: 'var(--text3)' }}>No predictions yet</div>
            : ['A','B','C','D','F'].map(g => (
                <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)', width: 16 }}>{g}</span>
                  <MiniBar value={gradeDist[g] || 0} max={maxGrade} color={gradeColors[g]} />
                  <span style={{ fontSize: 12, color: 'var(--text3)', width: 28, textAlign: 'right' }}>{gradeDist[g] || 0}</span>
                </div>
              ))
          }
        </div>

        <div className="card">
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>Model status</div>
          {[
            ['Pass / Fail classifier', status?.metrics?.pass_fail?.accuracy, 'accuracy'],
            ['Grade classifier (A–F)', status?.metrics?.grade?.accuracy, 'accuracy'],
            ['GPA regression', status?.metrics?.gpa?.r2, 'R²'],
            ['At-risk classifier', status?.metrics?.at_risk?.accuracy, 'accuracy'],
          ].map(([label, val, unit]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: 'var(--text2)' }}>{label}</span>
              <span style={{ fontWeight: 500, color: val >= 0.9 ? 'var(--green)' : val >= 0.8 ? 'var(--amber)' : 'var(--red)' }}>
                {val ? `${(val * 100).toFixed(1)}% ${unit}` : status?.ready ? '—' : 'Not trained'}
              </span>
            </div>
          ))}
          <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text2)' }}>Student records</span>
            <span style={{ fontWeight: 500 }}>{studentCount ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10 }}>Quick actions</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-sm" onClick={() => onNavigate('predict')}>Predict a student</button>
          <button className="btn btn-sm" onClick={() => onNavigate('batch')}>Batch CSV upload</button>
          <button className="btn btn-sm" onClick={() => onNavigate('metrics')}>View model metrics</button>
          <button className="btn btn-sm" onClick={() => onNavigate('data')}>Manage data</button>
        </div>
      </div>
    </div>
  )
}
