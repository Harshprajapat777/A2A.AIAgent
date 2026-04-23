import AgentCard from './AgentCard'
import AgentArrow from './AgentArrow'

const AGENTS = ['Orchestrator', 'SearchAgent', 'AnalystAgent', 'WriterAgent']

export default function PipelineView({ agentStates, activeArrows }) {
  function getState(name) {
    return agentStates[name] || { status: 'idle', task: '' }
  }

  function isArrowActive(from, to) {
    return activeArrows.some(a => a.from === from && a.to === to)
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--bg-border)',
      borderRadius: '16px', padding: '20px',
    }}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
        Pipeline
      </p>

      {/* Agent flow: Orchestrator → Search → Analyst → Writer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap', rowGap: '12px' }}>
        <AgentCard name="Orchestrator" {...getState('Orchestrator')} />
        <AgentArrow active={isArrowActive('Orchestrator', 'SearchAgent')}  label="A2A" />
        <AgentCard name="SearchAgent"  {...getState('SearchAgent')} />
        <AgentArrow active={isArrowActive('SearchAgent', 'Orchestrator') || isArrowActive('Orchestrator', 'AnalystAgent')} label="A2A" />
        <AgentCard name="AnalystAgent" {...getState('AnalystAgent')} />
        <AgentArrow active={isArrowActive('AnalystAgent', 'Orchestrator') || isArrowActive('Orchestrator', 'WriterAgent')} label="A2A" />
        <AgentCard name="WriterAgent"  {...getState('WriterAgent')} />
      </div>

      {/* MCP legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--bg-border)' }}>
        <MCPBadge agent="SearchAgent"  tool="search()"     color="#8b5cf6" />
        <MCPBadge agent="WriterAgent"  tool="write_file()" color="#06b6d4" />
      </div>
    </div>
  )
}

function MCPBadge({ agent, tool, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: color }} />
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        {agent} <span style={{ color }}>→ MCP:{tool}</span>
      </span>
    </div>
  )
}
