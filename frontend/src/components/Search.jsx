import { useState } from 'react'
import { parseRating } from '../useCompanies'
import styles from './Search.module.css'

export default function Search({ companies }) {
  const [query, setQuery] = useState('')

  const results = query.trim().length > 0
    ? companies.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : []

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>🔍 Search Company</h2>
      <input
        className={styles.input}
        type="text"
        placeholder="Type a company name..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className={styles.results}>
          {results.map(c => (
            <div key={c.name} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.name}>{c.name}</span>
                <span className={styles.rating}>⭐ {c.rating}</span>
              </div>
              <div className={styles.meta}>
                <span>💬 {c.reviews} Reviews</span>
                <span>🏭 {c.about}</span>
              </div>
              {c.stats.length > 0 && (
                <div className={styles.stats}>
                  {c.stats.map((s, i) => <span key={i} className={styles.stat}>{s}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {query.trim().length > 0 && results.length === 0 && (
        <p className={styles.empty}>No company found for "{query}"</p>
      )}
    </div>
  )
}
