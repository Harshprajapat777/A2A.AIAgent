import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Clock, ChevronRight } from 'lucide-react'
import { api } from '../../api/endpoints'

function fmt(iso) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function fmtSize(bytes) {
  return bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`
}

export default function ReportHistory() {
  const [reports, setReports] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.listReports().then(setReports).catch(() => {})
  }, [])

  if (!reports.length) return null

  return (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
        Past Reports
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {reports.map(r => (
          <button
            key={r.filename}
            onClick={() => navigate(`/reports/${encodeURIComponent(r.filename)}`)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-card)', border: '1px solid var(--bg-border)',
              borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bg-border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={16} color="#3b82f6" />
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                  {r.filename.replace(/^\d{4}-\d{2}-\d{2}_/, '').replace(/\.md$/, '').replace(/_/g, ' ')}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, display: 'flex', gap: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={10} /> {fmt(r.created_at)}
                  </span>
                  <span>{fmtSize(r.size)}</span>
                </p>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        ))}
      </div>
    </div>
  )
}
