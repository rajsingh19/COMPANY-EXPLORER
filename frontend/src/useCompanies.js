import { useState, useEffect } from 'react'

export function parseRating(r) {
  return parseFloat(r) || 0
}

export function parseReviews(r) {
  if (!r || r === 'N/A') return 0
  const s = r.replace(/,/g, '').trim()
  if (s.toLowerCase().endsWith('k')) return parseFloat(s) * 1000
  return parseFloat(s) || 0
}

export function useCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    fetch('/api/companies')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json() })
      .then(data => { setCompanies(data); setLoading(false) })
      .catch(e  => { setError(e.message); setLoading(false) })
  }, [])

  return { companies, loading, error }
}
