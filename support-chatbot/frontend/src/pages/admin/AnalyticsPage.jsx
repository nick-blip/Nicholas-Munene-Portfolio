import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import Stars from '../../components/Stars'

function Bar({ value, max, color }) {
  return (
    <div style={{ flex: 1, background: 'var(--surface2)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
      <div style={{ width: `${max > 0 ? Math.round(value / max * 100) : 0}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.4s' }} />
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAnalytics().then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading analytics…</div>
  if (!data) return <div style={{ color: 'var(--red-text)', fontSize: 14 }}>Failed to load analytics.</div>

  const dist = data.rating_distribution
  const maxDist = Math.max(...Object.values(dist), 1)
  const starColors = { 5: '#3B6D11', 4: '#3B6D11', 3: '#BA7517', 2: '#A32D2D', 1: '#A32D2D' }

  const maxDaily = Math.max(...(data.daily_volume.map(d => d.count)), 1)

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontWeight: 500, fontSize: 18 }}>Analytics</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>Overall chatbot performance and user satisfaction</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          ['Total conversations', data.total],
          ['Avg rating', data.avg_rating ? `${data.avg_rating} / 5` : '—'],
          ['KB match rate', `${data.kb_match_pct}%`],
          ['Satisfaction (4–5★)', `${data.satisfaction_pct}%`],
        ].map(([label, value]) => (
          <div key={label} className="metric-card">
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="card">
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>Rating distribution</div>
          {[5,4,3,2,1].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)', width: 28 }}>{s}★</span>
              <Bar value={dist[String(s)] || 0} max={maxDist} color={starColors[s]} />
              <span style={{ fontSize: 12, color: 'var(--text3)', width: 20, textAlign: 'right' }}>{dist[String(s)] || 0}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>Response source</div>
          {[
            ['Knowledge base', data.kb_count, 'var(--blue)'],
            ['AI (NLP)', data.nlp_count, '#BA7517'],
            ['System (universal)', data.universal_count, '#0F6E56'],
          ].map(([label, count, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, flex: 1 }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{count}</span>
            </div>
          ))}
          <div style={{ display: 'flex', height: 14, borderRadius: 4, overflow: 'hidden', gap: 2, marginTop: 12 }}>
            {[
              [data.kb_count, 'var(--blue)'],
              [data.nlp_count, '#BA7517'],
              [data.universal_count, '#0F6E56'],
            ].map(([val, color], i) => (
              data.total > 0 && <div key={i} style={{ flex: val, background: color, minWidth: val > 0 ? 4 : 0 }} />
            ))}
          </div>
          {data.flagged_count > 0 && (
            <div style={{ marginTop: 14, padding: '8px 10px', background: 'var(--amber-bg)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--amber-text)' }}>
              ⚑ {data.flagged_count} NLP answer{data.flagged_count !== 1 ? 's' : ''} flagged for review
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>Daily volume (last 14 days)</div>
        {data.daily_volume.length === 0 && <div style={{ fontSize: 13, color: 'var(--text3)' }}>No data yet.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[...data.daily_volume].reverse().map(d => (
            <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)', width: 90, flexShrink: 0 }}>{d.day}</span>
              <Bar value={d.count} max={maxDaily} color="var(--blue)" />
              <span style={{ fontSize: 12, color: 'var(--text3)', width: 24, textAlign: 'right' }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
