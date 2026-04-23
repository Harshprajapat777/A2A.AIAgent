const BASE = '/api'

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export function createWebSocket(jobId) {
  const wsBase = window.location.origin.replace(/^http/, 'ws')
  return new WebSocket(`${wsBase}/ws/stream/${jobId}`)
}
