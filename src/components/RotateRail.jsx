import { useLang } from '../i18n/index'
import { formatBytes } from '../utils/format'
import {
  IconRotateLeft, IconRotateRight, IconFlipH, IconFlipV,
} from './Icons'
import styles from './RotateRail.module.css'

const OPS = [
  { id: 'rotate90ccw', labelKey: 'rotate.ccw', Icon: IconRotateLeft },
  { id: 'rotate90cw',  labelKey: 'rotate.cw',  Icon: IconRotateRight },
  { id: 'flipH',       labelKey: 'rotate.flipH', Icon: IconFlipH },
  { id: 'flipV',       labelKey: 'rotate.flipV', Icon: IconFlipV },
]

export default function RotateRail({ image, originalImage, processing, onOp, onReset }) {
  const { t } = useLang()
  const isTransformed = image.src !== originalImage.src

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
        <h5 className={styles.sectionTitle}>{t('rail.transform')}</h5>
        <div className={styles.rotateGrid}>
          {OPS.map(({ id, labelKey, Icon }) => (
            <button
              key={id}
              className={styles.rotBtn}
              disabled={processing}
              onClick={() => onOp(id)}
            >
              <span className={styles.ico}><Icon /></span>
              {t(labelKey)}
            </button>
          ))}
        </div>
        <button
          className={styles.resetBtn}
          disabled={!isTransformed || processing}
          onClick={onReset}
        >
          ↺ {t('rotate.reset')}
        </button>
      </div>

      <div className={styles.section}>
        <h5 className={styles.sectionTitle}>{t('rail.beforeAfter')}</h5>
        <div className={styles.ba}>
          <div className={styles.thumb}>
            <span className={styles.tag}>{t('rail.before')}</span>
            <img src={originalImage.src} alt="before" />
          </div>
          <div className={styles.thumb}>
            <span className={styles.tag}>{t('rail.after')}</span>
            <img src={image.src} alt="after" />
          </div>
        </div>
      </div>
    </>
  )
}
