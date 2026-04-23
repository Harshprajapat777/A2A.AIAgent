import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import { api } from '../../api/endpoints'

export default function SearchBox({ externalTopic = '', onExternalTopicUsed }) {
  const [topic, setTopic]     = useState(externalTopic)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate              = useNavigate()

  useEffect(() => {
    if (externalTopic) { setTopic(externalTopic); onExternalTopicUsed?.() }
  }, [externalTopic])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    try {
      const { job_id } = await api.startResearch(topic.trim())
      navigate(`/research/${job_id}`)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{
            position: 'absolute', left: '16px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)',
          }} />
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="What do you want to research? e.g. How is AI changing software development"
            disabled={loading}
            style={{
              width: '100%', padding: '14px 16px 14px 44px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--bg-border)',
              borderRadius: '12px', color: 'var(--text-primary)',
              fontSize: '15px', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--bg-border)'}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          style={{
            padding: '14px 28px',
            background: loading || !topic.trim() ? 'var(--bg-border)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: 'none', borderRadius: '12px',
            color: 'white', fontWeight: 600, fontSize: '15px',
            cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
          {loading ? 'Starting...' : 'Research'}
        </button>
      </form>
      {error && (
        <p style={{ color: 'var(--red)', fontSize: '13px', marginTop: '8px' }}>{error}</p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
