import { useState } from 'react'
import { useCompanies } from './useCompanies'
import Navbar       from './components/Navbar'
import Search       from './components/Search'
import Filters      from './components/Filters'
import Compare      from './components/Compare'
import CompanyTable from './components/CompanyTable'
import styles from './App.module.css'

export default function App() {
  const { companies, loading, error } = useCompanies()
  const [filtered,   setFiltered]   = useState(null)
  const [tableTitle, setTableTitle] = useState('📋 All Companies')

  function handleFilter(result, isTop10) {
    setFiltered(result)
    setTableTitle(isTop10 ? '⭐ Top 10 by Rating' : `📋 Filtered Companies`)
  }

  const displayed = filtered ?? companies

  if (loading) return (
    <>
      <Navbar />
      <div className={styles.center}>
        <div className={styles.spinner} />
        <p>Scraping AmbitionBox… this may take a moment</p>
      </div>
    </>
  )

  if (error) return (
    <>
      <Navbar />
      <div className={styles.center}>
        <p className={styles.error}>❌ {error} — make sure FastAPI is running on port 8000</p>
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.grid2}>
          <div className={styles.card}><Search   companies={companies} /></div>
          <div className={styles.card}><Filters  companies={companies} onFilter={handleFilter} /></div>
        </div>
        <div className={styles.card}><Compare companies={companies} /></div>
        <div className={styles.card}>
          <CompanyTable companies={displayed} title={filtered ? tableTitle : undefined} />
        </div>
      </main>
    </>
  )
}
