import { useState } from 'react'

export default function Stars({ value = 0, onChange, size = 18 }) {
  const [hov, setHov] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <span
          key={s}
          onClick={() => onChange && onChange(s)}
          onMouseEnter={() => onChange && setHov(s)}
          onMouseLeave={() => onChange && setHov(0)}
          style={{
            fontSize: size,
            cursor: onChange ? 'pointer' : 'default',
            color: (hov || value) >= s ? '#EF9F27' : '#ccc',
            userSelect: 'none',
            lineHeight: 1,
          }}
        >★</span>
      ))}
    </div>
  )
}
