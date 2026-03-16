import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.icon}>🏢</span>
        <span>CompanyExplorer</span>
      </div>
      <span className={styles.badge}>Powered by AmbitionBox</span>
    </nav>
  )
}
