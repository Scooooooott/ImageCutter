import { useLang } from '../i18n/index'
import styles from './TabBar.module.css'

const TABS = ['cut', 'rotate']

export default function TabBar({ activeTab, onTabChange }) {
  const { t } = useLang()
  return (
    <div className={styles.bar}>
      {TABS.map((tab) => (
        <button
          key={tab}
          className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {t(`tab.${tab}`)}
        </button>
      ))}
    </div>
  )
}
