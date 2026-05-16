import { useRef, useCallback, useState } from 'react'
import { useLang } from '../i18n/index'
import { IconUpload } from './Icons'
import styles from './ImageInput.module.css'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'

export default function ImageInput({ onImage }) {
  const { t } = useLang()
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)

  const loadFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const src = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      onImage({
        src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        name: file.name || 'image.png',
        size: file.size,
        format: (file.type.split('/')[1] || 'png').toUpperCase().replace('JPEG', 'JPG'),
      })
    }
    img.src = src
  }, [onImage])

  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files?.[0]
    if (file) loadFile(file)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
  }

  return (
    <div
      className={`${styles.zone} ${drag ? styles.drag : ''}`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={t('upload.ariaLabel')}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) loadFile(f)
          e.target.value = ''
        }}
      />
      <div className={styles.glyph}>
        <IconUpload />
      </div>
      <h2 className={styles.title}>{t('upload.title')}</h2>
      <p className={styles.lede}>{t('upload.sub')}</p>
      <div className={styles.chips}>
        <span className={styles.chip}>PNG</span>
        <span className={styles.chip}>JPG</span>
        <span className={styles.chip}>WEBP</span>
        <span className={styles.chip}>GIF</span>
      </div>
    </div>
  )
}
