import { useRef, useEffect, useState } from 'react'
import { LANGS, useLang } from '../i18n/index'
import { IconGlobe, IconChevron } from './Icons'
import styles from './LangSwitcher.module.css'

const SHORT = { zh: '中', en: 'EN', es: 'ES', fr: 'FR', ca: 'CA', ja: '日' }

export default function LangSwitcher() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        className={styles.pill}
        onClick={() => setOpen((o) => !o)}
        aria-label="Language"
      >
        <span className={styles.globeIcon}><IconGlobe /></span>
        {SHORT[lang] ?? lang.toUpperCase()}
        <span className={styles.chevron}><IconChevron /></span>
      </button>
      {open && (
        <div className={styles.menu}>
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              className={`${styles.option} ${code === lang ? styles.active : ''}`}
              onClick={() => { setLang(code); setOpen(false) }}
            >
              {SHORT[code] ?? code.toUpperCase()} · {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
