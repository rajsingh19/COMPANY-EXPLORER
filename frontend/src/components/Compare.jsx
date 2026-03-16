import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { parseRating, parseReviews } from '../useCompanies'
import styles from './Compare.module.css'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b']

export default function Compare({ companies }) {
  const [selected, setSelected] = useState(['', '', ''])
  const [chart,    setChart]    = useState('bar')

  function pick(i, val) {
    setSelected(prev => { const n = [...prev]; n[i] = val; return n })
  }

  const chosen = selected
    .map(n => companies.find(c => c.name === n))
    .filter(Boolean)

  const bestRating = Math.max(...chosen.map(c => parseRating(c.rating)))

  const barData = chosen.map(c => ({
    name:    c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
    Rating:  parseRating(c.rating),
    Reviews: parseReviews(c.reviews)
  }))

  const radarData = [
    { metric: 'Rating',  ...Object.fromEntries(chosen.map(c => [c.name, parseRating(c.rating)])) },
    { metric: 'Reviews (k)', ...Object.fromEntries(chosen.map(c => [c.name, +(parseReviews(c.reviews) / 1000).toFixed(1)])) },
  ]

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>⚖️ Compare Companies</h2>

      <div className={styles.selects}>
        {[0, 1, 2].map(i => (
          <select key={i} className={styles.select} value={selected[i]} onChange={e => pick(i, e.target.value)}>
            <option value="">— Company {i + 1} —</option>
            {companies.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        ))}
      </div>

      {chosen.length >= 2 && (
        <>
          <div className={styles.cards}>
            {chosen.map((c, i) => (
              <div key={c.name} className={`${styles.card} ${parseRating(c.rating) === bestRating ? styles.best : ''}`}>
                {parseRating(c.rating) === bestRating && <span className={styles.crown}>🏆 Best</span>}
                <div className={styles.cardName}>{c.name}</div>
                <div className={styles.cardRating} style={{ color: COLORS[i] }}>⭐ {c.rating}</div>
                <div className={styles.cardMeta}>💬 {c.reviews} Reviews</div>
                <div className={styles.cardMeta}>🏭 {c.about}</div>
                {c.stats.map((s, j) => <div key={j} className={styles.cardStat}>{s}</div>)}
              </div>
            ))}
          </div>

          <div className={styles.chartToggle}>
            <button className={chart === 'bar'    ? styles.activeTab : styles.tab} onClick={() => setChart('bar')}>Bar Chart</button>
            <button className={chart === 'radar'  ? styles.activeTab : styles.tab} onClick={() => setChart('radar')}>Radar Chart</button>
          </div>

          {chart === 'bar' && (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3050" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis yAxisId="left"  tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 5]} label={{ value: 'Rating', angle: -90, position: 'insideLeft', fill: '#6366f1', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Reviews', angle: 90, position: 'insideRight', fill: '#22c55e', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e3050', borderRadius: 8 }} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Bar yAxisId="left"  dataKey="Rating"  fill="#6366f1" radius={[6,6,0,0]} />
                <Bar yAxisId="right" dataKey="Reviews" fill="#22c55e" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chart === 'radar' && (
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e3050" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                {chosen.map((c, i) => (
                  <Radar key={c.name} name={c.name} dataKey={c.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.25} />
                ))}
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e3050', borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </>
      )}

      {chosen.length < 2 && (
        <p className={styles.hint}>Select at least 2 companies to compare</p>
      )}
    </div>
  )
}
