import { motion, AnimatePresence } from 'framer-motion'
import { Search, BarChart2, PenLine, GitBranch, CheckCircle, XCircle, Loader2 } from 'lucide-react'

const ICONS = {
  Orchestrator: GitBranch,
  SearchAgent:  Search,
  AnalystAgent: BarChart2,
  WriterAgent:  PenLine,
}

const STATUS_STYLES = {
  idle:      { border: 'var(--bg-border)',    bg: 'var(--bg-card)',      dot: '#475569' },
  working:   { border: '#f59e0b',             bg: 'rgba(245,158,11,0.05)', dot: '#f59e0b' },
  completed: { border: '#22c55e',             bg: 'rgba(34,197,94,0.05)',  dot: '#22c55e' },
  failed:    { border: '#ef4444',             bg: 'rgba(239,68,68,0.05)',  dot: '#ef4444' },
}

function statusKey(status) {
  if (!status || status === 'submitted') return 'idle'
  if (status === 'working')   return 'working'
  if (status === 'completed') return 'completed'
  if (status === 'failed')    return 'failed'
  return 'idle'
}

export default function AgentCard({ name, status, task }) {
  const key   = statusKey(status)
  const style = STATUS_STYLES[key]
  const Icon  = ICONS[name] || GitBranch

  return (
    <motion.div
      layout
      style={{
        border: `1px solid ${style.border}`,
        backgroundColor: style.bg,
        borderRadius: '12px', padding: '16px',
        minWidth: '150px', position: 'relative',
        transition: 'border-color 0.3s, background-color 0.3s',
      }}
    >
      {/* Pulse ring when working */}
      {key === 'working' && (
        <motion.div
          style={{
            position: 'absolute', inset: '-3px', borderRadius: '14px',
            border: '2px solid #f59e0b', opacity: 0,
          }}
          animate={{ opacity: [0, 0.6, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: key === 'working' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} color={key === 'working' ? '#f59e0b' : '#3b82f6'} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {name.replace('Agent', '')}
        </span>
      </div>

      {/* Status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          backgroundColor: style.dot,
        }} />
        <span style={{ fontSize: '11px', color: style.dot, fontWeight: 500 }}>
          {key === 'idle' ? 'Idle' : key.charAt(0).toUpperCase() + key.slice(1)}
        </span>
      </div>

      {/* Current task */}
      <AnimatePresence>
        {task && key === 'working' && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.3 }}
          >
            {task.length > 40 ? task.slice(0, 40) + '…' : task}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
