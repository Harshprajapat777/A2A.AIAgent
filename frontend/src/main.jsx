import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode removed — it double-invokes effects in dev which breaks WebSocket lifecycle
createRoot(document.getElementById('root')).render(<App />)
