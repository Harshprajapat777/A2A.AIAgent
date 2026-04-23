const EXAMPLES = [
  'How is AI changing software development in 2025?',
  'What are the latest trends in microservices architecture?',
  'Compare GitHub Copilot vs Cursor vs Tabnine',
  'Best practices for building multi-agent AI systems',
  'How are companies adopting the MCP protocol?',
  'Future of React and frontend frameworks in 2025',
]

export default function ExamplePrompts({ onSelect }) {
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
        Try an example:
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => onSelect(ex)}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--bg-border)',
              borderRadius: '20px',
              color: 'var(--text-muted)',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = 'var(--accent)'
              e.target.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = 'var(--bg-border)'
              e.target.style.color = 'var(--text-muted)'
            }}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
