import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const STATUS_COLOR = { submitted: '#f59e0b', working: '#3b82f6', completed: '#22c55e', failed: '#ef4444' }

function fmt(iso) { return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }

export default function A2ACallLog({ events }) {
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '0' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        A2A Call Log
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
        <AnimatePresence initial={false}>
          {events.length === 0 && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Waiting for agent calls...
            </p>
          )}
          {[...events].reverse().map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--bg-secondary)', borderRadius: '8px',
                border: '1px solid var(--bg-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#3b82f6' }}>{e.from_agent}</span>
                <ArrowRight size={10} color="var(--text-muted)" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#8b5cf6' }}>{e.to_agent}</span>
                <span style={{ marginLeft: 'auto', fontSize: '10px', color: STATUS_COLOR[e.status] || '#64748b', fontWeight: 600 }}>
                  {e.status}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{e.payload}</p>
              <p style={{ fontSize: '10px', color: '#334155', margin: '3px 0 0' }}>{fmt(e.timestamp)}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
