export function cropImage(image, hLines, vLines) {
  const { naturalWidth: W, naturalHeight: H, src } = image
  const rowBounds = [0, ...hLines, 1]
  const colBounds = [0, ...vLines, 1]

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const outputs = []

      for (let r = 0; r < rowBounds.length - 1; r++) {
        const row = []
        for (let c = 0; c < colBounds.length - 1; c++) {
          const sx = Math.round(colBounds[c] * W)
          const sy = Math.round(rowBounds[r] * H)
          const sw = Math.round(colBounds[c + 1] * W) - sx
          const sh = Math.round(rowBounds[r + 1] * H) - sy

          canvas.width = sw
          canvas.height = sh
          ctx.clearRect(0, 0, sw, sh)
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
          row.push(canvas.toDataURL('image/png'))
        }
        outputs.push(row)
      }
      resolve(outputs)
    }
    img.src = src
  })
}
