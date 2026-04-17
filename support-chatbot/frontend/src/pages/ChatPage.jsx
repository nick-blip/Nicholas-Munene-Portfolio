import { useState, useRef, useEffect } from 'react'
import { api } from '../utils/api'
import Stars from '../components/Stars'

function resolveTimeAnswer(answer) {
  if (!answer.startsWith('__TIME__') && !answer.startsWith('__DATE__')) return answer
  const tz = answer.startsWith('__TIME__') ? answer.slice(8) : answer.slice(8)
  const type = answer.startsWith('__TIME__') ? 'time' : 'date'
  try {
    const now = new Date()
    if (type === 'time') {
      const timeStr = now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true })
      const tzName = now.toLocaleDateString('en-US', { timeZone: tz, timeZoneName: 'short' }).split(', ')[1] || tz
      return `The current time is ${timeStr} (${tzName}).`
    } else {
      const dateStr = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      return `Today is ${dateStr}.`
    }
  } catch {
    return type === 'time' ? `Current time: ${new Date().toLocaleTimeString()}` : `Today: ${new Date().toLocaleDateString()}`
  }
}

export default function ChatPage() {
  const [msgs, setMsgs] = useState([{
    id: 'welcome', role: 'bot', text: 'Hello! Welcome to support. How can I help you today?', type: 'universal', rated: null
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottom = useRef(null)
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function send() {
    const q = input.trim()
    if (!q || loading) return
    setMsgs(m => [...m, { id: Date.now(), role: 'user', text: q }])
    setInput('')
    setLoading(true)
    try {
      const data = await api.sendMessage(q, tz)
      const answer = resolveTimeAnswer(data.answer)
      setMsgs(m => [...m, { id: data.id, logId: data.id, role: 'bot', text: answer, type: data.type, rated: null }])
    } catch (e) {
      setMsgs(m => [...m, { id: Date.now(), role: 'bot', text: 'Sorry, something went wrong. Please try again.', type: 'error', rated: null }])
    }
    setLoading(false)
  }

  async function rate(msgId, logId, stars) {
    setMsgs(m => m.map(msg => msg.id === msgId ? { ...msg, rated: stars } : msg))
    if (logId) {
      try { await api.rateMessage(logId, stars) } catch {}
    }
  }

  const tagLabel = { kb: 'Knowledge base', nlp: 'AI response', universal: 'System', error: 'Error' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: 15 }}>Support Assistant</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>We usually reply instantly</div>
        </div>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#3B6D11' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
            <div style={{ maxWidth: '78%' }}>
              <div style={{
                padding: '10px 14px', borderRadius: 14, fontSize: 14, lineHeight: 1.55,
                borderBottomRightRadius: msg.role === 'user' ? 3 : 14,
                borderBottomLeftRadius: msg.role === 'bot' ? 3 : 14,
                background: msg.role === 'user' ? 'var(--blue-bg)' : 'var(--surface2)',
                color: 'var(--text)',
              }}>
                {msg.text}
              </div>
            </div>
            {msg.role === 'bot' && msg.type && msg.type !== 'universal' && msg.id !== 'welcome' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 2 }}>
                <span className={`tag tag-${msg.type}`}>{tagLabel[msg.type] || msg.type}</span>
                {msg.rated
                  ? <Stars value={msg.rated} size={14} />
                  : <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>Rate:</span>
                      <Stars value={0} size={14} onChange={s => rate(msg.id, msg.logId, s)} />
                    </div>
                }
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--surface2)', padding: '12px 16px', borderRadius: 14, borderBottomLeftRadius: 3, display: 'flex', gap: 5 }}>
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}
        <div ref={bottom} />
      </div>

      <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--border)', background: 'var(--surface)', display: 'flex', gap: 8 }}>
        <input
          className="input"
          placeholder="Type your question…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
        />
        <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ whiteSpace: 'nowrap' }}>
          Send
        </button>
      </div>
    </div>
  )
}
