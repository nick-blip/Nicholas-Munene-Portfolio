import { useState, useEffect } from 'react'
import { api } from '../../utils/api'

export default function KBPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editKw, setEditKw] = useState('')
  const [editAns, setEditAns] = useState('')
  const [adding, setAdding] = useState(false)
  const [newKw, setNewKw] = useState('')
  const [newAns, setNewAns] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try { setEntries(await api.getKB()) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function startEdit(e) { setEditing(e.id); setEditKw(e.keywords.join(', ')); setEditAns(e.answer) }

  async function saveEdit(id) {
    setSaving(true)
    try {
      await api.updateKBEntry(id, editKw.split(',').map(k => k.trim()).filter(Boolean), editAns)
      setEditing(null); load()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  async function del(id) {
    if (!confirm('Delete this entry?')) return
    try { await api.deleteKBEntry(id); load() } catch (e) { setError(e.message) }
  }

  async function addEntry() {
    if (!newKw.trim() || !newAns.trim()) return
    setSaving(true)
    try {
      await api.createKBEntry(newKw.split(',').map(k => k.trim()).filter(Boolean), newAns)
      setNewKw(''); setNewAns(''); setAdding(false); load()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  const sourceColors = { default: 'tag-kb', manual: 'tag-universal', promoted: 'tag-nlp' }

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontWeight: 500, fontSize: 18 }}>Knowledge base</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{entries.length} entries — keyword-matched responses served before NLP</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(a => !a)}>{adding ? 'Cancel' : '+ Add entry'}</button>
      </div>

      {error && <div style={{ background: 'var(--red-bg)', color: 'var(--red-text)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {adding && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 12 }}>New entry</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Keywords (comma-separated)</label>
              <input className="input" placeholder="refund, money back, return" value={newKw} onChange={e => setNewKw(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Answer</label>
              <textarea className="input" rows={3} style={{ resize: 'vertical' }} placeholder="What the bot will say…" value={newAns} onChange={e => setNewAns(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={addEntry} disabled={saving}>Save entry</button>
              <button className="btn btn-sm" onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading…</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map(entry => (
            <div key={entry.id} className="card">
              {editing === entry.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Keywords</label>
                    <input className="input" value={editKw} onChange={e => setEditKw(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Answer</label>
                    <textarea className="input" rows={3} style={{ resize: 'vertical' }} value={editAns} onChange={e => setEditAns(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(entry.id)} disabled={saving}>Save</button>
                    <button className="btn btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {entry.keywords.map(k => <span key={k} className="tag tag-kb">{k}</span>)}
                      <span className={`tag ${sourceColors[entry.source] || 'tag-kb'}`} style={{ marginLeft: 4 }}>{entry.source}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                      <button className="btn btn-sm" onClick={() => startEdit(entry)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => del(entry.id)}>Delete</button>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{entry.answer}</p>
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Added {new Date(entry.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
