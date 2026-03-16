import { useState } from 'react'
import { parseRating, parseReviews } from '../useCompanies'
import styles from './Filters.module.css'

export default function Filters({ companies, onFilter }) {
  const [minRating,  setMinRating]  = useState('')
  const [minReviews, setMinReviews] = useState('')
  const [top10,      setTop10]      = useState(false)

  function apply(rating, reviews, isTop10) {
    let result = [...companies]
    if (isTop10) {
      result = result.sort((a, b) => parseRating(b.rating) - parseRating(a.rating)).slice(0, 10)
    } else {
      const r  = parseFloat(rating)  || 0
      const rv = parseFloat(reviews) || 0
      result = result.filter(c => parseRating(c.rating) >= r && parseReviews(c.reviews) >= rv)
    }
    onFilter(result, isTop10)
  }

  function handleTop10() {
    const next = !top10
    setTop10(next)
    if (!next) { apply(minRating, minReviews, false) }
    else        { apply('', '', true) }
  }

  function handleApply() {
    setTop10(false)
    apply(minRating, minReviews, false)
  }

  function handleReset() {
    setMinRating(''); setMinReviews(''); setTop10(false)
    onFilter(companies, false)
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>🎛️ Filters</h2>
      <div className={styles.row}>
        <label className={styles.label}>
          Min Rating
          <input
            className={styles.input}
            type="number" min="0" max="5" step="0.1"
            placeholder="e.g. 3.5"
            value={minRating}
            onChange={e => setMinRating(e.target.value)}
          />
        </label>
        <label className={styles.label}>
          Min Reviews
          <input
            className={styles.input}
            type="number" min="0"
            placeholder="e.g. 1000"
            value={minReviews}
            onChange={e => setMinReviews(e.target.value)}
          />
        </label>
        <button className={styles.btn}         onClick={handleApply}>Apply</button>
        <button className={styles.btnSecondary} onClick={handleReset}>Reset</button>
        <button className={`${styles.btnTop10} ${top10 ? styles.active : ''}`} onClick={handleTop10}>
          ⭐ Top 10
        </button>
      </div>
    </div>
  )
}
