import { Link } from 'react-router-dom'
import { Bot, Zap } from 'lucide-react'

export default function Header() {
  return (
    <header style={{
      borderBottom: '1px solid var(--bg-border)',
      backgroundColor: 'var(--bg-secondary)',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
            A2A Research
          </span>
          <span style={{
            fontSize: '11px', fontWeight: 600, color: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '4px', padding: '1px 6px',
          }}>
            BETA
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Zap size={13} />
            Powered by A2A + MCP + Claude
          </span>
        </div>
      </div>
    </header>
  )
}
