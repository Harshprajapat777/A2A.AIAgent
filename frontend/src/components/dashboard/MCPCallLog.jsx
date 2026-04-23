import { motion, AnimatePresence } from 'framer-motion'
import { Wrench } from 'lucide-react'

const TOOL_COLOR = { search: '#8b5cf6', write_file: '#06b6d4', read_file: '#f59e0b', list_reports: '#22c55e' }
function fmt(iso) { return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }

export default function MCPCallLog({ events }) {
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '16px', padding: '20px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        MCP Tool Calls
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
        <AnimatePresence initial={false}>
          {events.length === 0 && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Waiting for tool calls...
            </p>
          )}
          {[...events].reverse().map((e, i) => {
            const color = TOOL_COLOR[e.tool] || '#64748b'
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--bg-border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <Wrench size={11} color={color} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color }}>{e.tool}()</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>by {e.agent}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#334155' }}>{fmt(e.timestamp)}</span>
                </div>
                {e.input  && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>in: {e.input.slice(0, 60)}</p>}
                {e.output && <p style={{ fontSize: '11px', color: '#22c55e',           margin: '2px 0 0' }}>out: {e.output.slice(0, 60)}</p>}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
