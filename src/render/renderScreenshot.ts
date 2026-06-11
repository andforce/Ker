import type { RenderConfig } from '../types'
import { computeDeviceMetrics, drawDevice } from './drawFrame'

const FONT_FAMILY = '-apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'

function drawBackground(ctx: CanvasRenderingContext2D, config: RenderConfig, w: number, h: number) {
  const { background } = config
  if (background.type === 'solid' || background.colors.length === 1) {
    ctx.fillStyle = background.colors[0]
  } else {
    // CSS 风格角度：0deg 朝上，顺时针
    const rad = (background.angle * Math.PI) / 180
    const dx = Math.sin(rad)
    const dy = -Math.cos(rad)
    const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2
    const cx = w / 2
    const cy = h / 2
    const g = ctx.createLinearGradient(cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half)
    background.colors.forEach((color, i) => g.addColorStop(i / (background.colors.length - 1), color))
    ctx.fillStyle = g
  }
  ctx.fillRect(0, 0, w, h)
}

/** 中英文混排换行：先按手动换行符分段，再按字符贪心折行 */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const ch of paragraph) {
      if (line && ctx.measureText(line + ch).width > maxWidth) {
        lines.push(line)
        line = ch === ' ' ? '' : ch
      } else {
        line += ch
      }
    }
    lines.push(line)
  }
  return lines.filter((l, _i, arr) => l !== '' || arr.length === 1)
}

interface TextLayout {
  height: number
  draw: (centerX: number, topY: number) => void
}

function layoutText(ctx: CanvasRenderingContext2D, config: RenderConfig, w: number): TextLayout {
  const { text } = config
  const titleSize = w * 0.058 * text.scale
  const subtitleSize = titleSize * 0.52
  const maxWidth = w * 0.86

  ctx.font = `600 ${titleSize}px ${FONT_FAMILY}`
  const titleLines = text.title.trim() ? wrapLines(ctx, text.title.trim(), maxWidth) : []
  ctx.font = `400 ${subtitleSize}px ${FONT_FAMILY}`
  const subtitleLines = text.subtitle.trim() ? wrapLines(ctx, text.subtitle.trim(), maxWidth) : []

  const titleLineH = titleSize * 1.3
  const subtitleLineH = subtitleSize * 1.45
  const gap = titleLines.length && subtitleLines.length ? titleSize * 0.35 : 0
  const height = titleLines.length * titleLineH + gap + subtitleLines.length * subtitleLineH

  return {
    height,
    draw(centerX, topY) {
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      let y = topY
      ctx.fillStyle = text.color
      ctx.font = `600 ${titleSize}px ${FONT_FAMILY}`
      for (const line of titleLines) {
        ctx.fillText(line, centerX, y + titleLineH / 2)
        y += titleLineH
      }
      y += gap
      ctx.globalAlpha = 0.82
      ctx.font = `400 ${subtitleSize}px ${FONT_FAMILY}`
      for (const line of subtitleLines) {
        ctx.fillText(line, centerX, y + subtitleLineH / 2)
        y += subtitleLineH
      }
      ctx.globalAlpha = 1
    },
  }
}

/**
 * 核心合成管线：背景 → 文案 → 设备外壳与截图。
 * 所有尺寸均与画布宽高成比例，预览与导出共用，保证所见即所得。
 */
export function renderScreenshot(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  config: RenderConfig,
  width: number,
  height: number,
) {
  canvas.width = width
  canvas.height = height
  // alpha: false 让导出的 PNG 不含透明通道（App Store Connect 不接受透明截图）
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('无法创建 Canvas 上下文')
  ctx.imageSmoothingQuality = 'high'

  drawBackground(ctx, config, width, height)

  const padY = height * 0.05
  const padX = width * 0.1
  const textLayout = layoutText(ctx, config, width)
  const textGap = textLayout.height > 0 ? height * 0.035 : 0

  const availTop = config.text.position === 'top' ? padY + textLayout.height + textGap : padY
  const availBottom = config.text.position === 'bottom' ? height - padY - textLayout.height - textGap : height - padY
  const avail = { x: padX, y: availTop, w: width - 2 * padX, h: availBottom - availTop }

  const screenAspect = image.naturalWidth / image.naturalHeight
  const metrics = computeDeviceMetrics(avail, screenAspect, config.frame)
  drawDevice(ctx, metrics, config.frame, image)

  if (textLayout.height > 0) {
    const textTop = config.text.position === 'top' ? padY : height - padY - textLayout.height
    textLayout.draw(width / 2, textTop)
  }
}
