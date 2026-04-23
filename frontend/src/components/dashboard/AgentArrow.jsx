import { motion, AnimatePresence } from 'framer-motion'

export default function AgentArrow({ active, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', minWidth: '60px' }}>
      {/* Arrow line */}
      <div style={{ position: 'relative', width: '60px', height: '2px', backgroundColor: active ? '#3b82f6' : 'var(--bg-border)', borderRadius: '2px', transition: 'background-color 0.3s' }}>
        {/* Moving dot when active */}
        <AnimatePresence>
          {active && (
            <motion.div
              style={{
                position: 'absolute', top: '50%', translateY: '-50%',
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: '#3b82f6',
                boxShadow: '0 0 8px #3b82f6',
              }}
              initial={{ left: '0%' }}
              animate={{ left: '100%' }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </AnimatePresence>
        {/* Arrowhead */}
        <div style={{
          position: 'absolute', right: '-1px', top: '50%',
          transform: 'translateY(-50%)',
          width: 0, height: 0,
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderLeft: `6px solid ${active ? '#3b82f6' : 'var(--bg-border)'}`,
          transition: 'border-color 0.3s',
        }} />
      </div>
      {/* Label */}
      {label && (
        <span style={{ fontSize: '9px', color: active ? '#3b82f6' : 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.03em', transition: 'color 0.3s' }}>
          {label}
        </span>
      )}
    </div>
  )
}
