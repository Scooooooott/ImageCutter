import { useState } from 'react'
import { useLang } from '../i18n/index'
import { IconDownload, IconCopy } from './Icons'
import styles from './OutputCard.module.css'

export default function OutputCard({ dataURL, row, col, aspectRatio }) {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = dataURL
    a.download = `image_${row}_${col}.png`
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
    <div
      className={`${styles.tile} ${copied ? styles.copied : ''}`}
      style={aspectRatio != null ? { aspectRatio } : undefined}
    >
      <img src={dataURL} alt={`${row}_${col}`} />
      <span className={styles.tileTag}>{row}_{col}</span>
      <div className={styles.actions}>
        <button onClick={handleDownload}>
          <IconDownload />
          {t('card.download')}
        </button>
        <button onClick={handleCopy}>
          <IconCopy />
          {copied ? t('card.copied') : t('card.copy')}
        </button>
      </div>
    </div>
  )
}
