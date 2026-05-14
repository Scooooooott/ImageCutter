import { useState, useCallback, useEffect, useRef } from 'react'
import ImageInput from './components/ImageInput'
import Editor from './components/Editor'
import OutputGrid from './components/OutputGrid'
import LangSwitcher from './components/LangSwitcher'
import { cropImage } from './utils/crop'
import { useLang } from './i18n/index'
import styles from './App.module.css'

export default function App() {
  const { t } = useLang()
  const [image, setImage] = useState(null)
  const [hLines, setHLines] = useState([])
  const [vLines, setVLines] = useState([])
  const [outputs, setOutputs] = useState([])
  const debounceRef = useRef(null)

  const handleImage = useCallback((img) => {
    setImage(img)
    setHLines([])
    setVLines([])
    setOutputs([])
  }, [])

  const handleReset = () => {
    if (image?.src) URL.revokeObjectURL(image.src)
    setImage(null)
    setHLines([])
    setVLines([])
    setOutputs([])
  }

  const generate = useCallback(async () => {
    if (!image) return
    const result = await cropImage(image, hLines, vLines)
    setOutputs(result)
  }, [image, hLines, vLines])

  // Auto re-crop with debounce when lines change (only if outputs exist)
  useEffect(() => {
    if (!image || outputs.length === 0) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => generate(), 300)
    return () => clearTimeout(debounceRef.current)
  }, [hLines, vLines]) // eslint-disable-line react-hooks/exhaustive-deps

  // Global paste listener
  useEffect(() => {
    if (image) return
    const handler = (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          const src = URL.createObjectURL(file)
          const img = new Image()
          img.onload = () => handleImage({ src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight })
          img.src = src
          break
        }
      }
    }
    window.addEventListener('paste', handler)
    return () => window.removeEventListener('paste', handler)
  }, [image, handleImage])

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Image Cutter</h1>
        <LangSwitcher />
      </div>
      <p className={styles.privacy}>{t('privacy')}</p>

      {!image ? (
        <ImageInput onImage={handleImage} />
      ) : (
        <>
          <div className={styles.reupload}>
            <button className={styles.reuploadBtn} onClick={handleReset}>
              {t('reupload')}
            </button>
          </div>
          <p className={styles.hint}>{t('resize.hint')}</p>
          <Editor
            image={image}
            hLines={hLines}
            vLines={vLines}
            onHLines={setHLines}
            onVLines={setVLines}
            onGenerate={generate}
          />
          <OutputGrid outputs={outputs} />
        </>
      )}
    </div>
  )
}
