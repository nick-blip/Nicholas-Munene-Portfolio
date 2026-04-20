import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function DataManager() {
  const [students, setStudents] = useState([])
  const [count, setCount] = useState(0)
  const [predictions, setPredictions] = useState([])
  const [tab, setTab] = useState('students')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [seedN, setSeedN] = useState(200)
  const [csvFile, setCsvFile] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      const [s, c, p] = await Promise.all([api.getStudents(), api.countStudents(), api.getPredictions()])
      setStudents(s); setCount(c.count); setPredictions(p)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function seed() {
    setMsg(''); setError('')
    try { await api.seedSynthetic(seedN); setMsg(`Seeded ${seedN} synthetic students`); loadData() }
    catch (e) { setError(e.message) }
  }

  async function uploadCSV() {
    if (!csvFile) return
    setMsg(''); setError('')
    try { const r = await api.uploadCSV(csvFile); setMsg(r.message); loadData() }
    catch (e) { setError(e.message) }
  }

  async function del(id) {
    try { await api.deleteStudent(id); loadData() }
    catch (e) { setError(e.message) }
  }

  const gradeTag = { A: 'tag-a', B: 'tag-b', C: 'tag-c', D: 'tag-d', F: 'tag-f' }

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">Data manager</div>
        <div className="section-sub">Manage student records and view prediction history</div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>Seed synthetic data</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="input" type="number" min={10} max={2000} value={seedN}
                onChange={e => setSeedN(parseInt(e.target.value))} style={{ width: 90 }} />
              <button className="btn btn-sm btn-primary" onClick={seed}>Seed students</button>
            </div>
          </div>
          <div style={{ borderLeft: '0.5px solid var(--border)', paddingLeft: 16 }}>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>Upload real data (CSV)</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])} style={{ fontSize: 13 }} />
              <button className="btn btn-sm" onClick={uploadCSV} disabled={!csvFile}>Upload</button>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Total records</div>
            <div style={{ fontSize: 22, fontWeight: 500 }}>{count}</div>
          </div>
        </div>
        {msg && <div className="alert alert-success" style={{ marginTop: 12, marginBottom: 0 }}>{msg}</div>}
        {error && <div className="alert alert-error" style={{ marginTop: 12, marginBottom: 0 }}>{error}</div>}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[['students', 'Student records'], ['predictions', 'Prediction history']].map(([id, label]) => (
          <button key={id} className="btn btn-sm" onClick={() => setTab(id)}
            style={{ background: tab === id ? 'var(--text)' : 'transparent', color: tab === id ? '#fff' : 'var(--text)', borderColor: tab === id ? 'var(--text)' : 'var(--border2)' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading…</div> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            {tab === 'students' ? (
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Student ID','Attend.','Assign. Avg','Test Avg','Prior GPA','SEI','Part-time hrs','Teacher Score','Action'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', borderBottom: '0.5px solid var(--border)', textAlign: 'left', fontSize: 12, color: 'var(--text2)', fontWeight: 500, whiteSpace: 'nowrap', background: 'var(--surface)' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {students.length === 0 && (
                    <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)' }}>No student records. Seed synthetic data or upload a CSV.</td></tr>
                  )}
                  {students.map(s => (
                    <tr key={s.student_id} style={{ borderBottom: '0.5px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>{s.student_id}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>{(s.attendance_rate * 100).toFixed(0)}%</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>{s.assignment_avg}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>{s.test_avg}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>{s.prior_gpa}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>{s.sei}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>{s.part_time_hours}h</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>{s.teacher_score}</td>
                      <td style={{ padding: '8px 12px' }}><button className="btn btn-sm btn-danger" onClick={() => del(s.student_id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Student ID','Pass/Fail','Confidence','Grade','GPA','Risk','Risk Conf.','Date'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', borderBottom: '0.5px solid var(--border)', textAlign: 'left', fontSize: 12, color: 'var(--text2)', fontWeight: 500, whiteSpace: 'nowrap', background: 'var(--surface)' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {predictions.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)' }}>No predictions yet. Use the Predict Student or Batch Predict pages.</td></tr>
                  )}
                  {predictions.map(p => (
                    <tr key={p.id} style={{ borderBottom: '0.5px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>{p.student_id || '—'}</td>
                      <td style={{ padding: '8px 12px' }}><span className={`tag ${p.pass_fail === 1 ? 'tag-pass' : 'tag-fail'}`}>{p.pass_fail === 1 ? 'Pass' : 'Fail'}</span></td>
                      <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>{Math.round(p.pass_confidence * 100)}%</td>
                      <td style={{ padding: '8px 12px' }}><span className={`tag ${gradeTag[p.grade] || 'tag-d'}`}>{p.grade}</span></td>
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>{p.predicted_gpa}</td>
                      <td style={{ padding: '8px 12px' }}><span className={`tag ${p.at_risk === 1 ? 'tag-risk' : 'tag-ok'}`}>{p.at_risk === 1 ? 'At Risk' : 'On Track'}</span></td>
                      <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>{Math.round(p.risk_confidence * 100)}%</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text3)', fontSize: 11 }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
