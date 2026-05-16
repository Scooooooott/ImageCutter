import { useLang } from '../i18n/index'
import { formatBytes } from '../utils/format'
import styles from './CutRail.module.css'

function isEven(arr, n) {
  return arr.length === n - 1 && arr.every((f, i) => Math.abs(f - (i + 1) / n) < 0.01)
}

function PresetMini({ n }) {
  return (
    <div
      className={styles.mini}
      style={{
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        gridTemplateRows: `repeat(${n}, 1fr)`,
      }}
    >
      {Array.from({ length: n * n }).map((_, i) => <div key={i} />)}
    </div>
  )
}

function SizePreview({ image, hLines, vLines }) {
  const hBounds = [0, ...hLines, 1]
  const vBounds = [0, ...vLines, 1]
  const rowFracs = hBounds.slice(1).map((v, i) => v - hBounds[i])
  const colFracs = vBounds.slice(1).map((v, i) => v - vBounds[i])
  const imageAr = image.naturalWidth / image.naturalHeight

  return (
    <div
      className={styles.sizePreview}
      style={{
        gridTemplateColumns: colFracs.map(f => `${f}fr`).join(' '),
        gridTemplateRows: rowFracs.map(f => `${f}fr`).join(' '),
        aspectRatio: String(imageAr),
      }}
    >
      {rowFracs.map((rFrac, r) =>
        colFracs.map((cFrac, c) => {
          const pw = Math.round(cFrac * image.naturalWidth)
          const ph = Math.round(rFrac * image.naturalHeight)
          return (
            <div key={`${r}-${c}`} className={styles.sizeCell}>
              <span>{pw}×{ph}</span>
            </div>
          )
        })
      )}
    </div>
  )
}

export default function CutRail({
  image, hLines, vLines,
  onAddH, onAddV, onDistributeH, onDistributeV, onApplyPreset,
  onDeleteH, onDeleteV,
}) {
  const { t } = useLang()

  const presetMatch = (() => {
    if (isEven(hLines, 2) && isEven(vLines, 2)) return 2
    if (isEven(hLines, 3) && isEven(vLines, 3)) return 3
    if (isEven(hLines, 4) && isEven(vLines, 4)) return 4
    return null
  })()

  return (
    <>
      <div className={styles.section}>
        <h5 className={styles.sectionTitle}>{t('rail.image')}</h5>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>{t('rail.dimensions')}</span>
          <span className={styles.infoValue}>{image.naturalWidth} × {image.naturalHeight}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>{t('rail.size')}</span>
          <span className={styles.infoValue}>{formatBytes(image.size)}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>{t('rail.format')}</span>
          <span className={styles.infoValue}>{image.format ?? '—'}</span>
        </div>
      </div>

      <div className={styles.section}>
        <h5 className={styles.sectionTitle}>{t('rail.gridPreset')}</h5>
        <div className={styles.presetGrid}>
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              className={`${styles.preset} ${presetMatch === n ? styles.presetActive : ''}`}
              onClick={() => onApplyPreset(n)}
            >
              <PresetMini n={n} />
              <span>{n} × {n}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h5 className={styles.sectionTitle}>
          {t('rail.manualLines')}
          <span className={styles.counter}>{hLines.length} / 10 · {vLines.length} / 10</span>
        </h5>
        <div className={styles.manualGrid}>
          <button className={styles.manualBtn} disabled={hLines.length >= 10} onClick={onAddH}>
            <span className={styles.plus}>+</span> {t('toolbar.addH')}
          </button>
          <button className={styles.manualBtn} disabled={vLines.length >= 10} onClick={onAddV}>
            <span className={styles.plus}>+</span> {t('toolbar.addV')}
          </button>
          <button className={styles.manualBtn} disabled={hLines.length === 0} onClick={onDistributeH}>
            {t('rail.distributeH')}
          </button>
          <button className={styles.manualBtn} disabled={vLines.length === 0} onClick={onDistributeV}>
            {t('rail.distributeV')}
          </button>
        </div>
      </div>

      {(hLines.length > 0 || vLines.length > 0) && (
        <div className={styles.section}>
          <div className={styles.lineList}>
            {hLines.map((frac, i) => {
              const px = Math.round(frac * image.naturalHeight)
              return (
                <div key={`h${i}`} className={styles.lineItem}>
                  <span className={styles.lineAxis}>— H{i + 1}</span>
                  <span className={styles.linePos}>{px} px</span>
                  <span className={styles.linePercent}>{(frac * 100).toFixed(1)}%</span>
                  <button className={styles.lineDelete} onClick={() => onDeleteH(i)}>×</button>
                </div>
              )
            })}
            {vLines.map((frac, i) => {
              const px = Math.round(frac * image.naturalWidth)
              return (
                <div key={`v${i}`} className={styles.lineItem}>
                  <span className={styles.lineAxis}>| V{i + 1}</span>
                  <span className={styles.linePos}>{px} px</span>
                  <span className={styles.linePercent}>{(frac * 100).toFixed(1)}%</span>
                  <button className={styles.lineDelete} onClick={() => onDeleteV(i)}>×</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h5 className={styles.sectionTitle}>{t('rail.outputPreview')}</h5>
        <SizePreview image={image} hLines={hLines} vLines={vLines} />
      </div>
    </>
  )
}
