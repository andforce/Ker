import JSZip from 'jszip'
import type { ExportSize, ScreenshotItem } from '../types'
import { renderScreenshot } from '../render/renderScreenshot'

export type ExportFormat = 'png' | 'jpeg'

function canvasToBlob(canvas: HTMLCanvasElement, format: ExportFormat): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('导出失败'))),
      format === 'png' ? 'image/png' : 'image/jpeg',
      0.92,
    )
  })
}

export async function renderToBlob(item: ScreenshotItem, size: ExportSize, format: ExportFormat): Promise<Blob> {
  const canvas = document.createElement('canvas')
  renderScreenshot(canvas, item.image, item.config, size.width, size.height)
  return canvasToBlob(canvas, format)
}

export function exportFileName(item: ScreenshotItem, size: ExportSize, format: ExportFormat, index: number): string {
  const base = item.name.replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]/g, '_') || `screenshot-${index + 1}`
  return `${base}_${size.width}x${size.height}.${format === 'png' ? 'png' : 'jpg'}`
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportSingle(item: ScreenshotItem, size: ExportSize, format: ExportFormat, index: number) {
  const blob = await renderToBlob(item, size, format)
  downloadBlob(blob, exportFileName(item, size, format, index))
}

export async function exportAllAsZip(items: ScreenshotItem[], size: ExportSize, format: ExportFormat) {
  const zip = new JSZip()
  for (let i = 0; i < items.length; i++) {
    const blob = await renderToBlob(items[i], size, format)
    zip.file(exportFileName(items[i], size, format, i), blob)
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(zipBlob, `appstore-screenshots-${size.width}x${size.height}.zip`)
}
