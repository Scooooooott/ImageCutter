import { useRef, useState, useCallback, useEffect } from 'react'
import { useLang } from '../i18n/index'
import styles from './Editor.module.css'

const COLOR_NORMAL = '#E24B4A'
const MAX_LINES = 10
const HITBOX = 16
const DEFAULT_WIDTH = 1200
const MIN_WIDTH = 300

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function round3(v) {
  return Math.round(v * 1000) / 1000
}

function insertLine(lines, pos) {
  return [...lines, pos].sort((a, b) => a - b)
}

function bestInsertPos(lines) {
  const boundaries = [0, ...lines, 1]
  let maxGap = 0
  let bestIdx = 0
  for (let i = 0; i < boundaries.length - 1; i++) {
    const gap = boundaries[i + 1] - boundaries[i]
    if (gap > maxGap) { maxGap = gap; bestIdx = i }
  }
  return round3((boundaries[bestIdx] + boundaries[bestIdx + 1]) / 2)
}

function distributeLines(count) {
  const result = []
  for (let i = 1; i <= count; i++) result.push(round3(i / (count + 1)))
  return result
}

export default function Editor({ image, hLines, vLines, onHLines, onVLines, onGenerate }) {
  const { t } = useLang()
  const imgRef = useRef(null)
  const canvasRef = useRef(null)
  const [imgRect, setImgRect] = useState(null)
  const [containerWidth, setContainerWidth] = useState(DEFAULT_WIDTH)
  const dragging = useRef(null)

  // Reset width when a new image is loaded
  useEffect(() => {
    setContainerWidth(DEFAULT_WIDTH)
  }, [image.src])

  const updateRect = useCallback(() => {
    if (imgRef.current) setImgRect(imgRef.current.getBoundingClientRect())
  }, [])

  useEffect(() => {
    updateRect()
    const ro = new ResizeObserver(updateRect)
    if (imgRef.current) ro.observe(imgRef.current)
    window.addEventListener('resize', updateRect)
    return () => { ro.disconnect(); window.removeEventListener('resize', updateRect) }
  }, [updateRect, image])

  // Line drag
  const startDrag = useCallback((e, type, idx) => {
    e.preventDefault()
    const rect = imgRef.current.getBoundingClientRect()
    dragging.current = { type, idx, rect }
    const move = (me) => {
      const { rect, type, idx } = dragging.current
      if (type === 'h') {
        const pct = round3(clamp((me.clientY - rect.top) / rect.height, 0.001, 0.999))
        onHLines(prev => { const next = [...prev]; next[idx] = pct; return next.sort((a, b) => a - b) })
      } else {
        const pct = round3(clamp((me.clientX - rect.left) / rect.width, 0.001, 0.999))
        onVLines(prev => { const next = [...prev]; next[idx] = pct; return next.sort((a, b) => a - b) })
      }
    }
    const up = () => {
      dragging.current = null
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }, [onHLines, onVLines])

  // Container resize handle drag
  const startResize = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = canvasRef.current.getBoundingClientRect().width
    const move = (me) => {
      const newWidth = Math.round(clamp(startWidth + (me.clientX - startX), MIN_WIDTH, 3000))
      setContainerWidth(newWidth)
    }
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }, [])

  const deleteLine = (type, idx) => {
    if (type === 'h') onHLines(prev => prev.filter((_, i) => i !== idx))
    else onVLines(prev => prev.filter((_, i) => i !== idx))
  }

  const addHLine = () => { if (hLines.length < MAX_LINES) onHLines(prev => insertLine(prev, bestInsertPos(prev))) }
  const addVLine = () => { if (vLines.length < MAX_LINES) onVLines(prev => insertLine(prev, bestInsertPos(prev))) }
  const equalizeH = () => { if (hLines.length > 0) onHLines(distributeLines(hLines.length)) }
  const equalizeV = () => { if (vLines.length > 0) onVLines(distributeLines(vLines.length)) }

  const svgW = imgRect?.width ?? 0
  const svgH = imgRect?.height ?? 0

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button className={styles.toolBtn} onClick={addHLine} disabled={hLines.length >= MAX_LINES}>
          {t('toolbar.addH')}
        </button>
        <button className={styles.toolBtn} onClick={addVLine} disabled={vLines.length >= MAX_LINES}>
          {t('toolbar.addV')}
        </button>
        <button className={styles.toolBtn} onClick={equalizeH} disabled={hLines.length === 0}>
          {t('toolbar.distH')}
        </button>
        <button className={styles.toolBtn} onClick={equalizeV} disabled={vLines.length === 0}>
          {t('toolbar.distV')}
        </button>
        <button className={`${styles.toolBtn} ${styles.generate}`} onClick={onGenerate}>
          {t('toolbar.generate')}
        </button>
      </div>

      <div
        ref={canvasRef}
        className={styles.canvas}
        style={{ width: containerWidth }}
      >
        <img
          ref={imgRef}
          src={image.src}
          alt="editing"
          className={styles.img}
          onLoad={updateRect}
          draggable={false}
        />

        {imgRect && (
          <svg
            className={styles.svg}
            width={svgW}
            height={svgH}
            style={{ left: imgRef.current.offsetLeft, top: imgRef.current.offsetTop }}
          >
            {hLines.map((pct, i) => {
              const y = pct * svgH
              return (
                <g key={`h${i}`}>
                  <line x1={0} y1={y} x2={svgW} y2={y} stroke={COLOR_NORMAL} strokeWidth={1} className={styles.line} />
                  <line x1={0} y1={y} x2={svgW} y2={y} stroke="transparent" strokeWidth={HITBOX}
                    style={{ cursor: 'ns-resize' }} onMouseDown={(e) => startDrag(e, 'h', i)} className={styles.hitbox} />
                  <g className={styles.deleteBtn} onClick={() => deleteLine('h', i)} style={{ cursor: 'pointer' }}
                    transform={`translate(${svgW - 20}, ${y - 10})`}>
                    <rect width={16} height={16} rx={3} fill="#fff" stroke="#ddd" />
                    <text x={8} y={12} textAnchor="middle" fontSize={12} fill={COLOR_NORMAL}>×</text>
                  </g>
                </g>
              )
            })}

            {vLines.map((pct, i) => {
              const x = pct * svgW
              return (
                <g key={`v${i}`}>
                  <line x1={x} y1={0} x2={x} y2={svgH} stroke={COLOR_NORMAL} strokeWidth={1} className={styles.line} />
                  <line x1={x} y1={0} x2={x} y2={svgH} stroke="transparent" strokeWidth={HITBOX}
                    style={{ cursor: 'ew-resize' }} onMouseDown={(e) => startDrag(e, 'v', i)} className={styles.hitbox} />
                  <g className={styles.deleteBtn} onClick={() => deleteLine('v', i)} style={{ cursor: 'pointer' }}
                    transform={`translate(${x + 4}, ${svgH - 20})`}>
                    <rect width={16} height={16} rx={3} fill="#fff" stroke="#ddd" />
                    <text x={8} y={12} textAnchor="middle" fontSize={12} fill={COLOR_NORMAL}>×</text>
                  </g>
                </g>
              )
            })}
          </svg>
        )}

        <div className={styles.handle} onMouseDown={startResize} />
      </div>
    </div>
  )
}
