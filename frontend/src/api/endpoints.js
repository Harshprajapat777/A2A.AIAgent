import { apiFetch } from './client'

export const api = {
  startResearch:  (topic)    => apiFetch('/research', { method: 'POST', body: JSON.stringify({ topic }) }),
  listJobs:       ()         => apiFetch('/jobs'),
  getJob:         (jobId)    => apiFetch(`/jobs/${jobId}`),
  listReports:    ()         => apiFetch('/reports'),
  getReport:      (filename) => apiFetch(`/reports/${filename}`),
  listAgents:     ()         => apiFetch('/agents'),
  health:         ()         => apiFetch('/health'),
}
