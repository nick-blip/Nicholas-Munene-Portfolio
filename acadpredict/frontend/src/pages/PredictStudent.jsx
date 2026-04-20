import { useState } from 'react'
import { api } from '../utils/api'

const DEFAULTS = {
  student_id: '', name: '',
  attendance_rate: 0.85, missed_classes: 10,
  assignment_avg: 72, test_avg: 68,
  prior_gpa: 2.8, sei: 5.5,
  scholarship: 0, part_time_hours: 8,
  teacher_score: 7.0, participation: 7.0,
}

const FIELDS = [
  { key: 'attendance_rate', label: 'Attendance rate', hint: '0.0 – 1.0', min: 0, max: 1, step: 0.01 },
  { key: 'missed_classes', label: 'Missed classes', hint: 'count', min: 0, max: 120, step: 1 },
  { key: 'assignment_avg', label: 'Assignment average', hint: '0 – 100', min: 0, max: 100, step: 0.1 },
  { key: 'test_avg', label: 'Test / exam average', hint: '0 – 100', min: 0, max: 100, step: 0.1 },
  { key: 'prior_gpa', label: 'Prior GPA (Year 1)', hint: '0.0 – 4.0', min: 0, max: 4, step: 0.01 },
  { key: 'sei', label: 'Socioeconomic index', hint: '1 – 10', min: 1, max: 10, step: 0.1 },
  { key: 'scholarship', label: 'Scholarship', hint: '0 = No, 1 = Yes', min: 0, max: 1, step: 1 },
  { key: 'part_time_hours', label: 'Part-time work hours/week', hint: '0 – 40', min: 0, max: 40, step: 0.5 },
  { key: 'teacher_score', label: 'Teacher assessment score', hint: '1 – 10', min: 1, max: 10, step: 0.1 },
  { key: 'participation', label: 'Participation rating', hint: '1 – 10', min: 1, max: 10, step: 0.1 },
]

const gradeColors = { A: 'var(--green)', B: 'var(--blue)', C: 'var(--amber)', D: 'var(--text2)', F: 'var(--red)' }
const gradeTag = { A: 'tag-a', B: 'tag-b', C: 'tag-c', D: 'tag-d', F: 'tag-f' }

function ConfidenceBadge({ label, confidence, colorVar }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 70, height: 70, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `3px solid ${colorVar}`, fontWeight: 600, fontSize: 15, color: colorVar, margin: '0 auto 6px'
      }}>
        {Math.round(confidence * 100)}%
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)' }}>confidence</div>
      <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default function PredictStudent() {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true); setResult(null)
    try { setResult(await api.predictStudent(form)) }
    catch (e) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">Predict student</div>
        <div className="section-sub">Enter student data to get pass/fail, grade, GPA, and risk predictions</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 16 }}>
        <form onSubmit={submit}>
          <div className="card">
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>Student info</div>
            <div className="grid-2" style={{ marginBottom: 14 }}>
              <div className="form-group"><label className="form-label">Student ID (optional)</label><input className="input" value={form.student_id} onChange={e => set('student_id', e.target.value)} placeholder="e.g. STU1001" /></div>
              <div className="form-group"><label className="form-label">Name (optional)</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Jane Doe" /></div>
            </div>

            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 12, borderTop: '0.5px solid var(--border)', paddingTop: 14 }}>Academic & profile features</div>
            <div className="grid-2">
              {FIELDS.map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label} <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>({f.hint})</span></label>
                  <input className="input" type="number" min={f.min} max={f.max} step={f.step}
                    value={form[f.key]} onChange={e => set(f.key, parseFloat(e.target.value) || 0)} />
                </div>
              ))}
            </div>

            {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Predicting…</> : 'Run prediction'}
              </button>
              <button className="btn btn-sm" type="button" onClick={() => { setForm(DEFAULTS); setResult(null) }}>Reset</button>
            </div>
          </div>
        </form>

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.name && <div style={{ fontWeight: 500, fontSize: 15 }}>{result.name} {result.student_id && <span style={{ color: 'var(--text3)', fontSize: 13 }}>· {result.student_id}</span>}</div>}

            <div className="card">
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 16 }}>Prediction results</div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
                <ConfidenceBadge
                  label={result.pass_fail.label}
                  confidence={result.pass_fail.confidence}
                  colorVar={result.pass_fail.prediction === 1 ? 'var(--green)' : 'var(--red)'}
                />
                <ConfidenceBadge
                  label={result.at_risk.label}
                  confidence={result.at_risk.confidence}
                  colorVar={result.at_risk.prediction === 1 ? 'var(--amber)' : 'var(--teal)'}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 16, justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Predicted grade</div>
                  <span className={`tag ${gradeTag[result.grade.prediction] || 'tag-d'}`} style={{ fontSize: 18, padding: '4px 16px' }}>
                    {result.grade.prediction}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Predicted GPA</div>
                  <span style={{ fontSize: 20, fontWeight: 600, color: gradeColors[result.grade.prediction] || 'var(--text)' }}>
                    {result.gpa.prediction}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Grade probabilities</div>
                {['A','B','C','D','F'].map(g => (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, width: 14, color: 'var(--text2)' }}>{g}</span>
                    <div className="bar-track" style={{ flex: 1 }}>
                      <div className="bar-fill" style={{
                        width: `${Math.round((result.grade.probabilities[g] || 0) * 100)}%`,
                        background: gradeColors[g] || '#aaa'
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text3)', width: 36, textAlign: 'right' }}>
                      {Math.round((result.grade.probabilities[g] || 0) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ background: result.at_risk.prediction === 1 ? 'var(--amber-bg)' : 'var(--green-bg)', borderColor: result.at_risk.prediction === 1 ? 'rgba(186,117,23,0.2)' : 'rgba(59,109,17,0.2)' }}>
              <div style={{ fontWeight: 500, fontSize: 13, color: result.at_risk.prediction === 1 ? 'var(--amber-text)' : 'var(--green-text)', marginBottom: 4 }}>
                {result.at_risk.prediction === 1 ? '⚑ At-risk alert' : '✓ On track'}
              </div>
              <div style={{ fontSize: 13, color: result.at_risk.prediction === 1 ? 'var(--amber-text)' : 'var(--green-text)' }}>
                {result.at_risk.prediction === 1
                  ? `This student has a ${Math.round(result.at_risk.confidence * 100)}% probability of being at risk of dropout. Consider early intervention.`
                  : `This student appears to be on track with a ${Math.round((1 - result.at_risk.confidence) * 100)}% likelihood of completing the course.`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
