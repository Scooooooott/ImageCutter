import OutputCard from './OutputCard'
import { useLang } from '../i18n/index'
import styles from './OutputGrid.module.css'

export default function OutputGrid({ outputs }) {
  const { t } = useLang()
  if (!outputs || outputs.length === 0) return null

  const colCount = outputs[0].length

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t('output.title')}</h2>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
      >
        {outputs.map((row, r) =>
          row.map((dataURL, c) => (
            <OutputCard key={`${r}-${c}`} dataURL={dataURL} row={r + 1} col={c + 1} />
          ))
        )}
      </div>
    </div>
  )
}
