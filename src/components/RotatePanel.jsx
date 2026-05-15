import { useState } from 'react'
import { useLang } from '../i18n/index'
import { transformImage } from '../utils/transform'
import styles from './RotatePanel.module.css'

const OPS = [
  { id: 'rotate90ccw', labelKey: 'rotate.ccw' },
  { id: 'rotate90cw',  labelKey: 'rotate.cw'  },
  { id: 'flipH',       labelKey: 'rotate.flipH' },
  { id: 'flipV',       labelKey: 'rotate.flipV' },
]

export default function RotatePanel({ image, originalImage, onImage }) {
  const { t } = useLang()
  const [processing, setProcessing] = useState(false)

  const handleOp = async (op) => {
    if (processing) return
    setProcessing(true)
    const newImage = await transformImage(image, op)
    if (image.src !== originalImage.src) {
      URL.revokeObjectURL(image.src)
    }
    onImage(newImage)
    setProcessing(false)
  }

  const handleReset = () => {
    if (image.src === originalImage.src) return
    URL.revokeObjectURL(image.src)
    onImage(originalImage)
  }

  const canReset = image.src !== originalImage.src

  return (
    <div className={styles.wrapper}>
      <div className={styles.preview}>
        <img
          src={image.src}
          alt="preview"
          className={`${styles.img} ${processing ? styles.dimmed : ''}`}
          draggable={false}
        />
      </div>
      <div className={styles.controls}>
        <div className={styles.group}>
          {OPS.map(({ id, labelKey }) => (
            <button
              key={id}
              className={styles.btn}
              onClick={() => handleOp(id)}
              disabled={processing}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        {canReset && (
          <button
            className={`${styles.btn} ${styles.resetBtn}`}
            onClick={handleReset}
            disabled={processing}
          >
            {t('rotate.reset')}
          </button>
        )}
      </div>
    </div>
  )
}
