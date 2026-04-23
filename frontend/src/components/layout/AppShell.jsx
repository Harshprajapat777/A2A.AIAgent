import Header from './Header'

export default function AppShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Header />
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 48px' }}>
        {children}
      </main>
    </div>
  )
}
