import { useRef, useCallback } from 'react'
import { useLang } from '../i18n/index'
import styles from './ImageInput.module.css'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'

export default function ImageInput({ onImage }) {
  const { t } = useLang()
  const inputRef = useRef(null)

  const loadFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const src = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      onImage({ src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight })
    }
    img.src = src
  }, [onImage])

  const handleFiles = (files) => {
    if (files && files.length > 0) loadFile(files[0])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        loadFile(item.getAsFile())
        break
      }
    }
  }, [loadFile])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
  }

  return (
    <div
      className={styles.zone}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onPaste={handlePaste}
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
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className={styles.icon}>🖼️</div>
      <p className={styles.primary}>{t('upload.prompt')}</p>
      <p className={styles.secondary}>{t('upload.hint')}</p>
    </div>
  )
}
