import { useState, useEffect } from 'react'
import { api } from '../utils/api'

function ConfusionMatrix({ matrix, labels }) {
  if (!matrix) return null
  return (
    <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr>
          <th style={{ padding: '4px 8px', color: 'var(--text3)' }}></th>
          {labels.map(l => <th key={l} style={{ padding: '4px 8px', color: 'var(--text2)' }}>Pred {l}</th>)}
        </tr>
      </thead>
      <tbody>
        {matrix.map((row, i) => (
          <tr key={i}>
            <td style={{ padding: '4px 8px', color: 'var(--text2)', fontWeight: 500 }}>Act {labels[i]}</td>
            {row.map((val, j) => (
              <td key={j} style={{
                padding: '6px 10px', textAlign: 'center', borderRadius: 4,
                background: i === j ? 'var(--green-bg)' : val > 0 ? 'var(--red-bg)' : 'var(--surface2)',
                color: i === j ? 'var(--green-text)' : val > 0 ? 'var(--red-text)' : 'var(--text3)',
                fontWeight: i === j ? 600 : 400, minWidth: 40
              }}>{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AccBar({ value, label }) {
  const pct = Math.round(value * 100)
  const color = value >= 0.9 ? 'var(--green)' : value >= 0.8 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 500, color }}>{pct}%</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function ModelMetrics() {
  const [metrics, setMetrics] = useState(null)
  const [status, setStatus] = useState(null)
  const [training, setTraining] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function load() {
    try {
      const s = await api.modelStatus()
      setStatus(s)
      if (s.ready) setMetrics(s.metrics)
    } catch {}
  }

  useEffect(() => { load() }, [])

  async function train() {
    setTraining(true); setMsg(''); setError('')
    try {
      const res = await api.trainModels()
      setMsg('Models trained successfully!')
      await load()
    } catch (e) { setError(e.message) }
    setTraining(false)
  }

  const fi = metrics?.feature_importance
  const fiMax = fi ? Math.max(...Object.values(fi)) : 1
  const fiColors = ['var(--blue)','var(--green)','var(--amber)','var(--purple)','var(--teal)','var(--red)','var(--blue)','var(--amber)','var(--green)','var(--purple)']

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">Model metrics</div>
        <div className="section-sub">Performance stats for all 4 trained models</div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Training</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
              {status?.ready ? `Trained on ${metrics?.training_samples?.toLocaleString() || '?'} synthetic student records` : 'Models not trained yet'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {msg && <span style={{ fontSize: 13, color: 'var(--green-text)' }}>{msg}</span>}
            {error && <span style={{ fontSize: 13, color: 'var(--red-text)' }}>{error}</span>}
            <button className="btn btn-success" onClick={train} disabled={training}>
              {training ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Training…</> : 'Train models'}
            </button>
          </div>
        </div>
      </div>

      {metrics && (
        <>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>Classification accuracy</div>
              <AccBar value={metrics.pass_fail?.accuracy || 0} label="Pass / Fail" />
              <AccBar value={metrics.grade?.accuracy || 0} label="Grade (A–F)" />
              <AccBar value={metrics.at_risk?.accuracy || 0} label="At-risk / dropout" />
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '0.5px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>GPA regression R²</span>
                  <span style={{ fontWeight: 500, color: 'var(--green)' }}>{(metrics.gpa?.r2 * 100).toFixed(1)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>GPA mean absolute error</span>
                  <span style={{ fontWeight: 500 }}>{metrics.gpa?.mae}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>Feature importance (pass/fail model)</div>
              {fi && Object.entries(fi).sort((a, b) => b[1] - a[1]).map(([feat, val], i) => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 11, color: 'var(--text2)', width: 130, flexShrink: 0 }}>{feat.replace(/_/g, ' ')}</span>
                  <div className="bar-track" style={{ flex: 1 }}>
                    <div className="bar-fill" style={{ width: `${Math.round(val / fiMax * 100)}%`, background: fiColors[i % fiColors.length] }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text3)', width: 36, textAlign: 'right' }}>{(val * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>Pass / Fail confusion matrix</div>
              <ConfusionMatrix matrix={metrics.pass_fail?.confusion_matrix} labels={['Fail','Pass']} />
            </div>
            <div className="card">
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>Grade confusion matrix</div>
              <div style={{ overflowX: 'auto' }}>
                <ConfusionMatrix matrix={metrics.grade?.confusion_matrix} labels={metrics.grade?.labels || ['A','B','C','D','F']} />
              </div>
            </div>
          </div>
        </>
      )}

      {!metrics && !training && (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text2)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>No models trained yet</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Click Train to build all 4 models using 2,000 synthetic student records</div>
          <button className="btn btn-success" onClick={train}>Train models now</button>
        </div>
      )}
    </div>
  )
}
