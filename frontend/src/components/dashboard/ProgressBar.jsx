import { motion } from 'framer-motion'

const STEPS = ['Search', 'Analyse', 'Write', 'Done']

export default function ProgressBar({ step }) {
  const pct = Math.min((step / (STEPS.length - 1)) * 100, 100)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        {STEPS.map((s, i) => (
          <span key={s} style={{ fontSize: '11px', fontWeight: 500, color: i <= step ? '#3b82f6' : 'var(--text-muted)', transition: 'color 0.4s' }}>
            {s}
          </span>
        ))}
      </div>
      <div style={{ height: '4px', backgroundColor: 'var(--bg-border)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
