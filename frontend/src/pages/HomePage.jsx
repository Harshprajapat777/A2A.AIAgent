import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import SearchBox from '../components/home/SearchBox'
import ExamplePrompts from '../components/home/ExamplePrompts'
import ReportHistory from '../components/home/ReportHistory'

export default function HomePage() {
  const [topic, setTopic] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ paddingTop: '64px', maxWidth: '720px', margin: '0 auto' }}
    >
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 32px rgba(59,130,246,0.3)',
        }}>
          <Bot size={28} color="white" />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Multi-Agent Research Assistant
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0 }}>
          Powered by A2A + MCP + Claude — watch 4 AI agents research any topic in real time
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <SearchBox externalTopic={topic} onExternalTopicUsed={() => setTopic('')} />
      </div>

      {/* Examples */}
      <div style={{ marginBottom: '48px' }}>
        <ExamplePrompts onSelect={setTopic} />
      </div>

      {/* Past reports */}
      <ReportHistory />
    </motion.div>
  )
}
