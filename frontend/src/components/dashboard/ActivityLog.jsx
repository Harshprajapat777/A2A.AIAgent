import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AGENT_COLOR = {
  Orchestrator: '#3b82f6', SearchAgent: '#8b5cf6',
  AnalystAgent: '#f59e0b', WriterAgent: '#06b6d4', System: '#64748b',
}

function fmt(iso) { return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }

export default function ActivityLog({ events }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events.length])

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '16px', padding: '20px', height: '100%' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        Activity Log
      </p>
      <div style={{ fontFamily: 'monospace', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '400px', overflowY: 'auto' }}>
        {events.length === 0 && (
          <span style={{ color: 'var(--text-muted)' }}>Waiting for activity...</span>
        )}
        <AnimatePresence initial={false}>
          {events.map((e, i) => {
            const color = AGENT_COLOR[e.agent] || '#64748b'
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}
              >
                <span style={{ color: '#334155', flexShrink: 0, fontSize: '10px', paddingTop: '1px' }}>{fmt(e.timestamp)}</span>
                <span style={{ color, flexShrink: 0, fontWeight: 600 }}>[{e.agent}]</span>
                <span style={{ color: 'var(--text-muted)', wordBreak: 'break-word' }}>{e.message}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
