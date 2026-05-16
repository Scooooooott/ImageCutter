import { useState, useCallback, useEffect, useRef } from 'react'
import ImageInput from './components/ImageInput'
import Editor from './components/Editor'
import OutputGrid from './components/OutputGrid'
import LangSwitcher from './components/LangSwitcher'
import TabBar from './components/TabBar'
import CutRail from './components/CutRail'
import RotateRail from './components/RotateRail'
import {
  IconPlus, IconDistribute, IconRotateLeft, IconRotateRight,
  IconFlipH, IconFlipV, IconReplace,
} from './components/Icons'
import { cropImage } from './utils/crop'
import { transformImage } from './utils/transform'
import { formatBytes } from './utils/format'
import { useLang } from './i18n/index'
import styles from './App.module.css'

const MAX_LINES = 10

function round4(v) {
  return Math.round(v * 10000) / 10000
}

function distributeLines(count) {
  return Array.from({ length: count }, (_, i) => round4((i + 1) / (count + 1)))
}

function bestInsertPos(lines) {
  const boundaries = [0, ...lines, 1]
  let maxGap = 0
  let bestIdx = 0
  for (let i = 0; i < boundaries.length - 1; i++) {
    const gap = boundaries[i + 1] - boundaries[i]
    if (gap > maxGap) { maxGap = gap; bestIdx = i }
  }
  return round4((boundaries[bestIdx] + boundaries[bestIdx + 1]) / 2)
}

export default function App() {
  const { t } = useLang()
  const [image, setImage] = useState(null)
  const [originalImage, setOriginalImage] = useState(null)
  const [activeTab, setActiveTab] = useState('cut')
  const [hLines, setHLines] = useState([])
  const [vLines, setVLines] = useState([])
  const [outputs, setOutputs] = useState([])
  const [processing, setProcessing] = useState(false)
  const [scale, setScale] = useState(1)
  const debounceRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleImage = useCallback((img) => {
    setOriginalImage(img)
    setImage(img)
    setActiveTab('cut')
    setHLines([])
    setVLines([])
    setOutputs([])
    setScale(1)
  }, [])

  const handleReplaceFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const src = URL.createObjectURL(file)
    const el = new Image()
    el.onload = () => {
      if (image?.src) URL.revokeObjectURL(image.src)
      if (originalImage?.src && originalImage.src !== image?.src) URL.revokeObjectURL(originalImage.src)
      const next = {
        src,
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
        name: file.name || 'image.png',
        size: file.size,
        format: (file.type.split('/')[1] || 'png').toUpperCase().replace('JPEG', 'JPG'),
      }
      setOriginalImage(next)
      setImage(next)
      setActiveTab('cut')
      setHLines([])
      setVLines([])
      setOutputs([])
      setScale(1)
    }
    el.src = src
  }, [image, originalImage])

  const handleTransformedImage = useCallback((newImage) => {
    setImage(newImage)
    setOutputs([])
  }, [])

  const handleTransformOp = useCallback(async (op) => {
    if (processing || !image) return
    setProcessing(true)
    try {
      const newImage = await transformImage(image, op)
      if (image.src !== originalImage.src) URL.revokeObjectURL(image.src)
      handleTransformedImage({ ...image, ...newImage })
    } finally {
      setProcessing(false)
    }
  }, [processing, image, originalImage, handleTransformedImage])

  const handleResetOriginal = useCallback(() => {
    if (!originalImage || !image || image.src === originalImage.src) return
    URL.revokeObjectURL(image.src)
    setImage(originalImage)
    setOutputs([])
  }, [image, originalImage])

  // Line management
  const addHLine = useCallback(() => {
    if (hLines.length >= MAX_LINES) return
    setHLines(prev => [...prev, bestInsertPos(prev)].sort((a, b) => a - b))
  }, [hLines])

  const addVLine = useCallback(() => {
    if (vLines.length >= MAX_LINES) return
    setVLines(prev => [...prev, bestInsertPos(prev)].sort((a, b) => a - b))
  }, [vLines])

  const equalizeH = useCallback(() => {
    if (hLines.length > 0) setHLines(distributeLines(hLines.length))
  }, [hLines])

  const equalizeV = useCallback(() => {
    if (vLines.length > 0) setVLines(distributeLines(vLines.length))
  }, [vLines])

  const applyPreset = useCallback((n) => {
    setHLines(distributeLines(n - 1))
    setVLines(distributeLines(n - 1))
  }, [])

  const deleteHLine = useCallback((idx) => {
    setHLines(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const deleteVLine = useCallback((idx) => {
    setVLines(prev => prev.filter((_, i) => i !== idx))
  }, [])

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

  // Global paste: only when no image loaded
  useEffect(() => {
    if (image) return
    const handler = (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          const src = URL.createObjectURL(file)
          const el = new Image()
          el.onload = () => handleImage({
            src,
            naturalWidth: el.naturalWidth,
            naturalHeight: el.naturalHeight,
            name: 'pasted.png',
            size: null,
            format: 'PNG',
          })
          el.src = src
          break
        }
      }
    }
    window.addEventListener('paste', handler)
    return () => window.removeEventListener('paste', handler)
  }, [image, handleImage])

  const sliceCount = (hLines.length + 1) * (vLines.length + 1)
  const distributeDisabled = hLines.length === 0 && vLines.length === 0

  return (
    <div>
      {/* hidden file input for replace */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleReplaceFile(f)
          e.target.value = ''
        }}
      />

      <header className={styles.appHeader}>
        <div className={styles.brand}>
          <div className={styles.logo}>✂</div>
          <span className={styles.brandName}>Image Cutter</span>
          <span className={styles.privacyPill}>{t('privacy')}</span>
        </div>
        <div className={styles.headerRight}>
          {image && (
            <button
              className={styles.iconBtn}
              title={t('reupload')}
              onClick={() => fileInputRef.current?.click()}
            >
              <IconReplace />
            </button>
          )}
          <LangSwitcher />
        </div>
      </header>

      {!image ? (
        <ImageInput onImage={handleImage} />
      ) : (
        <>
          <div className={styles.studio}>
            {/* Left: canvas column */}
            <div className={styles.canvasCol}>
              <div className={styles.toolbar}>
                <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
                <span className={styles.tbDivider} />

                <div className={styles.zoomGroup}>
                  <button
                    className={styles.zoomBtn}
                    onClick={() => setScale(s => Math.max(0.25, +(s - 0.25).toFixed(2)))}
                    disabled={scale <= 0.25}
                  >−</button>
                  <span className={styles.zoomLabel}>{Math.round(scale * 100)}%</span>
                  <button
                    className={styles.zoomBtn}
                    onClick={() => setScale(s => Math.min(2, +(s + 0.25).toFixed(2)))}
                    disabled={scale >= 2}
                  >+</button>
                </div>
                <span className={styles.tbDivider} />

                {activeTab === 'cut' ? (
                  <>
                    <button
                      className={styles.pillBtn}
                      disabled={hLines.length >= MAX_LINES}
                      onClick={addHLine}
                    >
                      <span className={styles.ico}><IconPlus /></span>
                      {t('toolbar.addH')}
                    </button>
                    <button
                      className={styles.pillBtn}
                      disabled={vLines.length >= MAX_LINES}
                      onClick={addVLine}
                    >
                      <span className={styles.ico}><IconPlus /></span>
                      {t('toolbar.addV')}
                    </button>
                    <button
                      className={styles.pillBtn}
                      disabled={distributeDisabled}
                      onClick={() => { if (hLines.length) equalizeH(); if (vLines.length) equalizeV() }}
                    >
                      <span className={styles.ico}><IconDistribute /></span>
                      {t('toolbar.distribute')}
                    </button>
                    <button
                      className={styles.cta}
                      onClick={generate}
                      disabled={processing}
                    >
                      {t('toolbar.generate')}
                      <span className={styles.badge}>{sliceCount > 1 ? sliceCount : '—'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button className={styles.pillBtn} disabled={processing} onClick={() => handleTransformOp('rotate90ccw')}>
                      <span className={styles.ico}><IconRotateLeft /></span>
                      {t('rotate.ccw')}
                    </button>
                    <button className={styles.pillBtn} disabled={processing} onClick={() => handleTransformOp('rotate90cw')}>
                      <span className={styles.ico}><IconRotateRight /></span>
                      {t('rotate.cw')}
                    </button>
                    <button className={styles.pillBtn} disabled={processing} onClick={() => handleTransformOp('flipH')}>
                      <span className={styles.ico}><IconFlipH /></span>
                      {t('rotate.flipH')}
                    </button>
                    <button className={styles.pillBtn} disabled={processing} onClick={() => handleTransformOp('flipV')}>
                      <span className={styles.ico}><IconFlipV /></span>
                      {t('rotate.flipV')}
                    </button>
                  </>
                )}
              </div>

              {activeTab === 'cut' && (
                <div className={styles.helper}>{t('helper')}</div>
              )}

              <Editor
                image={image}
                hLines={hLines}
                vLines={vLines}
                onHLines={setHLines}
                onVLines={setVLines}
                processing={processing}
                tab={activeTab}
                scale={scale}
              />

              <div className={styles.canvasFoot}>
                <span>{image.naturalWidth} × {image.naturalHeight} px</span>
                <span className={styles.dot} />
                <span>{formatBytes(image.size)}</span>
                <span className={styles.dot} />
                <span>{image.format ?? '—'}</span>
                {activeTab === 'cut' && sliceCount > 1 && (
                  <>
                    <span className={styles.dot} />
                    <span className={styles.count}>
                      {hLines.length + 1} × {vLines.length + 1} · {sliceCount}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right: rail */}
            <aside className={styles.rail}>
              {activeTab === 'cut' ? (
                <CutRail
                  image={image}
                  hLines={hLines}
                  vLines={vLines}
                  onAddH={addHLine}
                  onAddV={addVLine}
                  onDistributeH={equalizeH}
                  onDistributeV={equalizeV}
                  onApplyPreset={applyPreset}
                  onDeleteH={deleteHLine}
                  onDeleteV={deleteVLine}
                />
              ) : (
                <RotateRail
                  image={image}
                  originalImage={originalImage}
                  processing={processing}
                  onOp={handleTransformOp}
                  onReset={handleResetOriginal}
                />
              )}
            </aside>
          </div>

          <OutputGrid
            outputs={outputs}
            image={image}
            hLines={hLines}
            vLines={vLines}
          />
        </>
      )}
    </div>
  )
}
