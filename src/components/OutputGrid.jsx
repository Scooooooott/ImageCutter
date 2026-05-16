import OutputCard from './OutputCard'
import { useLang } from '../i18n/index'
import styles from './OutputGrid.module.css'

export default function OutputGrid({ outputs, image, hLines, vLines }) {
  const { t } = useLang()
  if (!outputs || outputs.length === 0) return null

  const rows = outputs.length
  const cols = outputs[0]?.length ?? 0

  const hBounds = [0, ...(hLines || []), 1]
  const vBounds = [0, ...(vLines || []), 1]

  return (
    <div className={styles.results} id="results">
      <div className={styles.resultsHeader}>
        <div>
          <h3 className={styles.resultsTitle}>{t('output.title')}</h3>
          <div className={styles.sub}>{rows} × {cols} · image_r_c.png</div>
        </div>
      </div>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {outputs.map((row, r) =>
          row.map((dataURL, c) => {
            const wFrac = vBounds[c + 1] - vBounds[c]
            const hFrac = hBounds[r + 1] - hBounds[r]
            const aspectRatio = image ? wFrac / hFrac : 1
            return (
              <OutputCard
                key={`${r}-${c}`}
                dataURL={dataURL}
                row={r + 1}
                col={c + 1}
                aspectRatio={aspectRatio}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
