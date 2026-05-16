import { useLang } from '../i18n/index'
import { IconCut, IconRotate } from './Icons'
import styles from './TabBar.module.css'

const TABS = [
  { id: 'cut',    icon: IconCut },
  { id: 'rotate', icon: IconRotate },
]

export default function TabBar({ activeTab, onTabChange }) {
  const { t } = useLang()
  return (
    <div className={styles.group}>
      {TABS.map(({ id, icon: Icon }) => (
        <button
          key={id}
          className={`${styles.tab} ${activeTab === id ? styles.active : ''}`}
          onClick={() => onTabChange(id)}
        >
          <span className={styles.icon}><Icon /></span>
          {t(`tab.${id}`)}
        </button>
      ))}
    </div>
  )
}
