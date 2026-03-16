import { useState } from 'react'
import { parseRating, parseReviews } from '../useCompanies'
import styles from './CompanyTable.module.css'

export default function CompanyTable({ companies, title }) {
  const [sortField, setSortField] = useState(null)
  const [sortAsc,   setSortAsc]   = useState(false)

  function toggleSort(field) {
    if (sortField === field) setSortAsc(p => !p)
    else { setSortField(field); setSortAsc(false) }
  }

  const sorted = [...companies].sort((a, b) => {
    if (!sortField) return 0
    const va = sortField === 'rating' ? parseRating(a.rating) : parseReviews(a.reviews)
    const vb = sortField === 'rating' ? parseRating(b.rating) : parseReviews(b.reviews)
    return sortAsc ? va - vb : vb - va
  })

  const bestRating = Math.max(...companies.map(c => parseRating(c.rating)))

  function arrow(field) {
    if (sortField !== field) return ' ↕'
    return sortAsc ? ' ↑' : ' ↓'
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>{title || '📋 Companies'} <span className={styles.count}>({companies.length})</span></h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Company</th>
              <th className={styles.sortable} onClick={() => toggleSort('rating')}>Rating{arrow('rating')}</th>
              <th className={styles.sortable} onClick={() => toggleSort('reviews')}>Reviews{arrow('reviews')}</th>
              <th>About</th>
              <th>Stats</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => {
              const isBest = parseRating(c.rating) === bestRating && bestRating > 0
              return (
                <tr key={c.name} className={isBest ? styles.bestRow : ''}>
                  <td className={styles.num}>{i + 1}</td>
                  <td>
                    <span className={styles.name}>{c.name}</span>
                    {isBest && <span className={styles.badge}>⭐ Best</span>}
                  </td>
                  <td><span className={styles.rating}>{c.rating}</span></td>
                  <td>{c.reviews}</td>
                  <td className={styles.about}>{c.about}</td>
                  <td>
                    <div className={styles.stats}>
                      {c.stats.map((s, j) => <span key={j} className={styles.stat}>{s}</span>)}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
