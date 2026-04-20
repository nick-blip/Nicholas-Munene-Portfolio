import { useState } from 'react'
import { api } from '../utils/api'

const gradeTag = { A: 'tag-a', B: 'tag-b', C: 'tag-c', D: 'tag-d', F: 'tag-f' }

export default function BatchPredict() {
  const [file, setFile] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sample, setSample] = useState(null)

  async function loadSample() {
    try { setSample(await api.sampleCSV()) } catch (e) { setError(e.message) }
  }

  async function run() {
    if (!file) return
    setError(''); setLoading(true); setResults(null)
    try { setResults(await api.predictBatch(file)) }
    catch (e) { setError(e.message) }
    setLoading(false)
  }

  function downloadResults() {
    if (!results) return
    const cols = ['student_id','pass_label','pass_confidence','grade','predicted_gpa','risk_label','risk_confidence']
    const rows = results.predictions.map(r => cols.map(c => r[c]).join(','))
    const csv = [cols.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'predictions.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const REQUIRED_COLS = ['attendance_rate','missed_classes','assignment_avg','test_avg','prior_gpa','sei','scholarship','part_time_hours','teacher_score','participation']

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">Batch predict</div>
        <div className="section-sub">Upload a CSV of student records to predict outcomes for all of them at once</div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 12 }}>Upload CSV</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>
            Required columns:
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {REQUIRED_COLS.map(c => <code key={c} style={{ fontSize: 11, background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>{c}</code>)}
            </div>
          </div>
          <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} style={{ fontSize: 13, marginBottom: 12, display: 'block' }} />
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={run} disabled={!file || loading}>
              {loading ? <><span className="spinner" style={{ width: 13, height: 13 }} /> Running…</> : 'Run predictions'}
            </button>
            <button className="btn btn-sm" onClick={loadSample}>View sample format</button>
          </div>
        </div>

        {sample && (
          <div className="card">
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10 }}>Sample CSV format</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>{['student_id', ...REQUIRED_COLS].map(c => <th key={c} style={{ padding: '4px 6px', borderBottom: '0.5px solid var(--border)', textAlign: 'left', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {sample.sample.slice(0,3).map((row, i) => (
                    <tr key={i}>{['student_id',...REQUIRED_COLS].map(c => <td key={c} style={{ padding: '4px 6px', borderBottom: '0.5px solid var(--border)', whiteSpace: 'nowrap', color: 'var(--text2)' }}>{row[c]}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {results && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Results — {results.count} students</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                Pass: {results.predictions.filter(r => r.pass_fail === 1).length} &nbsp;·&nbsp;
                At-risk: {results.predictions.filter(r => r.at_risk === 1).length} &nbsp;·&nbsp;
                Avg GPA: {(results.predictions.reduce((s, r) => s + (r.predicted_gpa || 0), 0) / results.count).toFixed(2)}
              </div>
            </div>
            <button className="btn btn-sm" onClick={downloadResults}>↓ Download CSV</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Student ID','Pass/Fail','Confidence','Grade','Pred. GPA','Risk','Risk Conf.'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', borderBottom: '0.5px solid var(--border)', textAlign: 'left', fontSize: 12, color: 'var(--text2)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {results.predictions.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '0.5px solid var(--border)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 500 }}>{r.student_id}</td>
                    <td style={{ padding: '8px 10px' }}><span className={`tag ${r.pass_fail === 1 ? 'tag-pass' : 'tag-fail'}`}>{r.pass_label}</span></td>
                    <td style={{ padding: '8px 10px', color: 'var(--text2)' }}>{Math.round(r.pass_confidence * 100)}%</td>
                    <td style={{ padding: '8px 10px' }}><span className={`tag ${gradeTag[r.grade] || 'tag-d'}`}>{r.grade}</span></td>
                    <td style={{ padding: '8px 10px', fontWeight: 500 }}>{r.predicted_gpa}</td>
                    <td style={{ padding: '8px 10px' }}><span className={`tag ${r.at_risk === 1 ? 'tag-risk' : 'tag-ok'}`}>{r.risk_label}</span></td>
                    <td style={{ padding: '8px 10px', color: 'var(--text2)' }}>{Math.round(r.risk_confidence * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
