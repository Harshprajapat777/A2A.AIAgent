import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ReportViewer({ content }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--bg-border)',
      borderRadius: '16px', padding: '32px',
      color: 'var(--text-primary)', lineHeight: 1.75,
    }}>
      <style>{`
        .report h1 { font-size: 26px; font-weight: 700; color: #e2e8f0; margin: 0 0 8px; }
        .report h2 { font-size: 18px; font-weight: 600; color: #cbd5e1; margin: 28px 0 10px; padding-bottom: 6px; border-bottom: 1px solid var(--bg-border); }
        .report h3 { font-size: 15px; font-weight: 600; color: #94a3b8; margin: 18px 0 8px; }
        .report p  { color: #94a3b8; margin: 8px 0; font-size: 14px; }
        .report ul, .report ol { padding-left: 20px; margin: 8px 0; }
        .report li { color: #94a3b8; font-size: 14px; margin: 4px 0; }
        .report blockquote { border-left: 3px solid #3b82f6; padding: 8px 16px; margin: 12px 0; background: rgba(59,130,246,0.05); border-radius: 0 8px 8px 0; }
        .report blockquote p { color: #64748b; font-style: italic; }
        .report code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #7dd3fc; font-family: monospace; }
        .report pre  { background: var(--bg-secondary); padding: 16px; border-radius: 10px; overflow-x: auto; }
        .report pre code { background: none; padding: 0; }
        .report a { color: #3b82f6; text-decoration: none; }
        .report a:hover { text-decoration: underline; }
        .report hr { border: none; border-top: 1px solid var(--bg-border); margin: 24px 0; }
        .report table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 12px 0; }
        .report th { background: var(--bg-secondary); padding: 8px 12px; text-align: left; color: #94a3b8; border: 1px solid var(--bg-border); }
        .report td { padding: 8px 12px; border: 1px solid var(--bg-border); color: #64748b; }
        .report strong { color: #cbd5e1; }
      `}</style>
      <div className="report">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
