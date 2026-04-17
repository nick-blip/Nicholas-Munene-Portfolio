import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import Stars from '../../components/Stars'

export default function NLPLogPage() {
  const [data, setData] = useState(null)
  const [promoting, setPromoting] = useState(null)
  const [promoteKw, setPromoteKw] = useState('')
  const [promoteAns, setPromoteAns] = useState('')
  const [filter, setFilter] = useState('flagged')
  const [saving, setSaving] = useState(false)

  async function load() {
    try { setData(await api.getAnalytics()) } catch {}
  }
  useEffect(() => { load() }, [])

  async function getLogs() {
    const res = await api.getLogs()
    return res
  }

  const [logs, setLogs] = useState([])
  useEffect(() => { getLogs().then(setLogs).catch(() => {}) }, [])

  const nlpLogs = logs.filter(l => l.response_type === 'nlp')
  const displayed = filter === 'flagged'
    ? nlpLogs.filter(l => l.flagged_for_review && !l.promoted)
    : filter === 'all'
    ? nlpLogs
    : nlpLogs.filter(l => !l.rating)

  function startPromote(log) {
    const words = log.question.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3).slice(0, 4)
    setPromoting(log.id)
    setPromoteKw(words.join(', '))
    setPromoteAns(log.answer)
  }

  async function doPromote(logId) {
    setSaving(true)
    try {
      await api.promoteToKB(logId, promoteKw.split(',').map(k => k.trim()).filter(Boolean), promoteAns)
      setPromoting(null)
      getLogs().then(setLogs)
    } catch (e) { alert(e.message) }
    setSaving(false)
  }

  const counts = {
    flagged: nlpLogs.filter(l => l.flagged_for_review && !l.promoted).length,
    unrated: nlpLogs.filter(l => !l.rating).length,
    all: nlpLogs.length,
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontWeight: 500, fontSize: 18 }}>NLP review</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
          AI-generated answers that scored low — promote good ones to the knowledge base to reduce future NLP calls
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[['flagged', `Flagged (${counts.flagged})`], ['unrated', `Unrated (${counts.unrated})`], ['all', `All NLP (${counts.all})`]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className="btn btn-sm"
            style={{ background: filter === id ? 'var(--text)' : 'transparent', color: filter === id ? 'white' : 'var(--text)', borderColor: filter === id ? 'var(--text)' : 'var(--border2)' }}
          >{label}</button>
        ))}
      </div>

      {displayed.length === 0 && (
        <div className="card" style={{ color: 'var(--text2)', fontSize: 14, textAlign: 'center', padding: '2rem' }}>
          No entries in this filter. {filter === 'flagged' && 'Flagged entries appear when users rate a response 1–2 stars.'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {displayed.map(log => (
          <div key={log.id} className="card">
            {promoting === log.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>Promote to knowledge base</div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Keywords (comma-separated)</label>
                  <input className="input" value={promoteKw} onChange={e => setPromoteKw(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Answer (edit before saving)</label>
                  <textarea className="input" rows={3} style={{ resize: 'vertical' }} value={promoteAns} onChange={e => setPromoteAns(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => doPromote(log.id)} disabled={saving}>Promote</button>
                  <button className="btn btn-sm" onClick={() => setPromoting(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    {log.flagged_for_review ? <span className="tag tag-flagged">Low rated</span> : null}
                    {log.promoted ? <span className="tag tag-promoted">Promoted</span> : null}
                    {!log.rating && <span className="tag" style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>No rating</span>}
                    {log.rating && <Stars value={log.rating} size={13} />}
                  </div>
                  {!log.promoted && (
                    <button className="btn btn-sm" onClick={() => startPromote(log)} style={{ flexShrink: 0 }}>→ Add to KB</button>
                  )}
                </div>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>{log.question}</div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 6 }}>{log.answer}</p>
                <p style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(log.created_at).toLocaleString()} · {log.timezone}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
