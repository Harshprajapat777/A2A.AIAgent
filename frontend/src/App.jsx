import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ReportPage from './pages/ReportPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"                    element={<HomePage />} />
          <Route path="/research/:jobId"     element={<DashboardPage />} />
          <Route path="/reports/:filename"   element={<ReportPage />} />
          <Route path="*"                    element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
