import { useState } from 'react'
import { useLang } from '../i18n/index'
import styles from './OutputCard.module.css'

export default function OutputCard({ dataURL, row, col }) {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = dataURL
    a.download = `cut_${row}_${col}.png`
    a.click()
  }

  const handleCopy = async () => {
    try {
      const res = await fetch(dataURL)
      const blob = await res.blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard API not supported or denied
    }
  }

  return (
    <div className={styles.card}>
      <img src={dataURL} alt={`cut_${row}_${col}`} className={styles.img} />
      <div className={styles.actions}>
        <button className={styles.btn} onClick={handleDownload}>{t('card.download')}</button>
        <button className={styles.btn} onClick={handleCopy}>
          {copied ? t('card.copied') : t('card.copy')}
        </button>
      </div>
    </div>
  )
}
