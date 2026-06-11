import { useEffect, useRef } from 'react'
import type { ExportSize, ScreenshotItem } from '../types'
import { renderScreenshot } from '../render/renderScreenshot'

interface Props {
  item: ScreenshotItem
  size: ExportSize
}

/** 预览以 1/2 分辨率渲染（渲染管线按比例缩放，所见即所得），CSS 自适应容器 */
export function PreviewCanvas({ item, size }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    renderScreenshot(canvas, item.image, item.config, Math.round(size.width / 2), Math.round(size.height / 2))
  }, [item.image, item.config, size])

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 p-6">
      <canvas ref={canvasRef} className="min-h-0 max-w-full flex-1 rounded-xl shadow-2xl" style={{ width: 'auto' }} />
      <div className="text-xs text-zinc-500">
        导出尺寸 {size.width} × {size.height} px
      </div>
    </div>
  )
}
