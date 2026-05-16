import { useRef, useState, useCallback, useEffect } from 'react'
import styles from './Editor.module.css'

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function round4(v) {
  return Math.round(v * 10000) / 10000
}

function CutLine({ axis, frac, isDragging, onMouseDown, onDelete }) {
  const style = axis === 'h' ? { top: `${frac * 100}%` } : { left: `${frac * 100}%` }
  return (
    <div
      className={`${styles.cutLine} ${styles[axis]} ${isDragging ? styles.dragging : ''}`}
      style={style}
      onMouseDown={onMouseDown}
    >
      <div className={styles.visual} />
      <button
        className={styles.deleteBtn}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        title="Remove"
      >
        ×
      </button>
    </div>
  )
}

export default function Editor({ image, hLines, vLines, onHLines, onVLines, processing, tab, scale }) {
  const wrapRef = useRef(null)
  const stageRef = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [dragging, setDragging] = useState(null)

  const measure = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const ar = image.naturalWidth / image.naturalHeight
    let w = wrap.clientWidth * scale
    let h = w / ar
    if (scale <= 1) {
      const maxH = Math.max(wrap.clientHeight - 8, 100)
      if (h > maxH) { h = maxH; w = h * ar }
    }
    setSize({ w: Math.round(w), h: Math.round(h) })
  }, [image, scale])

  useEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [measure])

  const startDrag = useCallback((axis, idx) => (e) => {
    e.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    setDragging({ axis, idx })

    const move = (ev) => {
      const frac = axis === 'h'
        ? clamp((ev.clientY - rect.top) / rect.height, 0.001, 0.999)
        : clamp((ev.clientX - rect.left) / rect.width, 0.001, 0.999)
      const f = round4(frac)
      if (axis === 'h') {
        onHLines(prev => { const next = [...prev]; next[idx] = f; return next.sort((a, b) => a - b) })
      } else {
        onVLines(prev => { const next = [...prev]; next[idx] = f; return next.sort((a, b) => a - b) })
      }
      setDragging({ axis, idx })
    }
    const up = () => {
      setDragging(null)
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }, [onHLines, onVLines])

  const deleteLine = useCallback((axis, idx) => {
    if (axis === 'h') onHLines(prev => prev.filter((_, i) => i !== idx))
    else onVLines(prev => prev.filter((_, i) => i !== idx))
  }, [onHLines, onVLines])

  return (
    <div className={styles.stageWrap} ref={wrapRef}>
      <div
        className={`${styles.stage} ${processing ? styles.processing : ''}`}
        ref={stageRef}
        style={size.w > 0 ? { width: size.w } : undefined}
      >
        <img src={image.src} alt="" draggable={false} />
        {tab === 'cut' && (
          <div className={styles.overlay}>
            {hLines.map((frac, i) => (
              <CutLine
                key={`h${i}`}
                axis="h"
                frac={frac}
                isDragging={dragging?.axis === 'h' && dragging.idx === i}
                onMouseDown={startDrag('h', i)}
                onDelete={() => deleteLine('h', i)}
              />
            ))}
            {vLines.map((frac, i) => (
              <CutLine
                key={`v${i}`}
                axis="v"
                frac={frac}
                isDragging={dragging?.axis === 'v' && dragging.idx === i}
                onMouseDown={startDrag('v', i)}
                onDelete={() => deleteLine('v', i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
