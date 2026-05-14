import { LANGS, useLang } from '../i18n/index'
import styles from './LangSwitcher.module.css'

export default function LangSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <select
      className={styles.select}
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label="Language"
    >
      {LANGS.map(({ code, label }) => (
        <option key={code} value={code}>{label}</option>
      ))}
    </select>
  )
}
