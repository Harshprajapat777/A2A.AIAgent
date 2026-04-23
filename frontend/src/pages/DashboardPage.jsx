import { useEffect, useReducer, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createWebSocket } from '../api/client'
import PipelineView  from '../components/dashboard/PipelineView'
import ProgressBar   from '../components/dashboard/ProgressBar'
import A2ACallLog    from '../components/dashboard/A2ACallLog'
import MCPCallLog    from '../components/dashboard/MCPCallLog'
import ActivityLog   from '../components/dashboard/ActivityLog'

// ── State shape ───────────────────────────────────────────────────────────────
const init = {
  agentStates:  {},           // { agentName: { status, task } }
  activeArrows: [],           // [{ from, to }]  — active A2A calls
  a2aEvents:    [],
  mcpEvents:    [],
  logEvents:    [],
  step:         0,
  done:         false,
  reportFile:   null,
  topic:        '',
}

function reducer(state, event) {
  switch (event.type) {

    case 'agent_status':
      return {
        ...state,
        agentStates: {
          ...state.agentStates,
          [event.agent]: { status: event.status, task: event.task },
        },
        step: event.status === 'completed'
          ? Math.min(state.step + 1, 3)
          : state.step,
      }

    case 'a2a_call': {
      // Add / remove active arrows
      const arrow = { from: event.from_agent, to: event.to_agent }
      const active = event.status === 'submitted'
        ? [...state.activeArrows, arrow]
        : state.activeArrows.filter(a => !(a.from === arrow.from && a.to === arrow.to))
      return { ...state, activeArrows: active, a2aEvents: [...state.a2aEvents, event] }
    }

    case 'mcp_call':
      // Merge input + output for same tool into one entry
      if (event.output && state.mcpEvents.length > 0) {
        const last = state.mcpEvents[state.mcpEvents.length - 1]
        if (last.tool === event.tool && last.agent === event.agent && !last.output) {
          return { ...state, mcpEvents: [...state.mcpEvents.slice(0, -1), { ...last, output: event.output }] }
        }
      }
      return { ...state, mcpEvents: [...state.mcpEvents, event] }

    case 'log':
      return { ...state, logEvents: [...state.logEvents, event] }

    case 'done':
      return { ...state, done: true, step: 3, reportFile: event.report_file, activeArrows: [] }

    default:
      return state
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { jobId }     = useParams()
  const navigate      = useNavigate()
  const [state, dispatch] = useReducer(reducer, init)
  const wsRef         = useRef(null)

  useEffect(() => {
    let ws
    let closed = false

    // Small delay to ensure backend job is registered before connecting
    const timer = setTimeout(() => {
      if (closed) return

      ws = createWebSocket(jobId)
      wsRef.current = ws

      ws.onmessage = (msg) => {
        try { dispatch(JSON.parse(msg.data)) } catch (_) {}
      }

      ws.onerror = () => {
        dispatch({ type: 'log', agent: 'System', message: 'WebSocket connection error', timestamp: new Date().toISOString() })
      }

      ws.onclose = (e) => {
        if (e.code === 4004) {
          dispatch({ type: 'log', agent: 'System', message: `Job not found: ${jobId}`, timestamp: new Date().toISOString() })
        }
      }
    }, 300)

    return () => {
      closed = true
      clearTimeout(timer)
      if (ws && ws.readyState !== WebSocket.CONNECTING) ws.close()
    }
  }, [jobId])

  // Auto-navigate to report when done
  useEffect(() => {
    if (state.done && state.reportFile) {
      const timer = setTimeout(() => {
        navigate(`/reports/${encodeURIComponent(state.reportFile)}`)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [state.done, state.reportFile])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Job ID: {jobId}</p>
        <ProgressBar step={state.step} />
        {state.done && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: '13px', color: '#22c55e', marginTop: '8px', fontWeight: 500 }}
          >
            Pipeline complete — redirecting to report...
          </motion.p>
        )}
      </div>

      {/* Pipeline visual */}
      <div style={{ marginBottom: '20px' }}>
        <PipelineView agentStates={state.agentStates} activeArrows={state.activeArrows} />
      </div>

      {/* 3 log panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <A2ACallLog events={state.a2aEvents} />
        <MCPCallLog events={state.mcpEvents} />
      </div>

      {/* Activity log full width */}
      <ActivityLog events={state.logEvents} />
    </motion.div>
  )
}
