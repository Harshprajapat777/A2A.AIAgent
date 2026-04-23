import { useState } from 'react'
import { Download, Copy, Check } from 'lucide-react'

export default function ExportButton({ content, filename }) {
  const [copied, setCopied] = useState(false)

  function download() {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  async function copy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const btn = {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '8px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    border: '1px solid var(--bg-border)',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={download} style={{ ...btn, backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bg-border)'}
      >
        <Download size={14} /> Download .md
      </button>
      <button onClick={copy} style={{ ...btn, backgroundColor: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg-card)', color: copied ? '#22c55e' : 'var(--text-primary)', borderColor: copied ? '#22c55e' : 'var(--bg-border)' }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}
