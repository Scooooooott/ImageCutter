export function transformImage(image, op) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const W = img.naturalWidth
      const H = img.naturalHeight
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (op === 'rotate90cw' || op === 'rotate90ccw') {
        canvas.width = H
        canvas.height = W
      } else {
        canvas.width = W
        canvas.height = H
      }

      ctx.save()
      switch (op) {
        case 'rotate90cw':
          ctx.translate(H, 0)
          ctx.rotate(Math.PI / 2)
          break
        case 'rotate90ccw':
          ctx.translate(0, W)
          ctx.rotate(-Math.PI / 2)
          break
        case 'flipH':
          ctx.translate(W, 0)
          ctx.scale(-1, 1)
          break
        case 'flipV':
          ctx.translate(0, H)
          ctx.scale(1, -1)
          break
      }
      ctx.drawImage(img, 0, 0)
      ctx.restore()

      canvas.toBlob((blob) => {
        resolve({
          src: URL.createObjectURL(blob),
          naturalWidth: canvas.width,
          naturalHeight: canvas.height,
          size: blob.size,
          format: 'PNG',
        })
      }, 'image/png')
    }
    img.src = image.src
  })
}
