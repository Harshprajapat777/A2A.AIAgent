import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import { api } from '../api/endpoints'
import ReportViewer from '../components/report/ReportViewer'
import ExportButton from '../components/report/ExportButton'

export default function ReportPage() {
  const { filename }      = useParams()
  const [report, setReport]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    const decoded = decodeURIComponent(filename)
    api.getReport(decoded)
      .then(setReport)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filename])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
      Loading report...
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--red)' }}>
      {error}
    </div>
  )

  const title = report.filename
    .replace(/^\d{4}-\d{2}-\d{2}_/, '')
    .replace(/\.md$/, '')
    .replace(/_/g, ' ')

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: '32px', maxWidth: '860px', margin: '0 auto' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <ExportButton content={report.content} filename={report.filename} />
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <FileText size={20} color="#3b82f6" />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'capitalize' }}>
            {title}
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            {(report.size / 1024).toFixed(1)} KB · {report.filename}
          </p>
        </div>
      </div>

      {/* Report */}
      <ReportViewer content={report.content} />
    </motion.div>
  )
}
