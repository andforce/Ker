import type { FrameConfig } from '../types'
import { FRAME_COLORS, OUTLINE_COLORS } from '../constants/presets'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface DeviceMetrics {
  device: Rect
  screen: Rect
  bodyRadius: number
  screenRadius: number
}

/** 机身边框总厚度（金属圈 + 黑色屏幕边框）占机身宽度的比例 */
const BEZEL_RATIO = 0.03
const BODY_RADIUS_RATIO = 0.165

/**
 * 在给定可用区域内计算机身与屏幕的位置：
 * 屏幕长宽比始终与截图一致，保证截图不被裁切变形。
 */
export function computeDeviceMetrics(avail: Rect, screenAspect: number, frame: FrameConfig): DeviceMetrics {
  const bezelRatio = frame.style === 'realistic' ? BEZEL_RATIO : 0
  // deviceH = (deviceW - 2b) / aspect + 2b，其中 b = bezelRatio * deviceW
  const hPerW = (1 - 2 * bezelRatio) / screenAspect + 2 * bezelRatio
  let deviceW = avail.w
  if (deviceW * hPerW > avail.h) deviceW = avail.h / hPerW
  const deviceH = deviceW * hPerW
  const bezel = deviceW * bezelRatio
  const device: Rect = {
    x: avail.x + (avail.w - deviceW) / 2,
    y: avail.y + (avail.h - deviceH) / 2,
    w: deviceW,
    h: deviceH,
  }
  const screen: Rect = {
    x: device.x + bezel,
    y: device.y + bezel,
    w: deviceW - 2 * bezel,
    h: deviceH - 2 * bezel,
  }
  const bodyRadius = frame.style === 'realistic' ? deviceW * BODY_RADIUS_RATIO : deviceW * 0.11
  return { device, screen, bodyRadius, screenRadius: Math.max(bodyRadius - bezel, deviceW * 0.06) }
}

function roundRectPath(ctx: CanvasRenderingContext2D, r: Rect, radius: number) {
  ctx.beginPath()
  ctx.roundRect(r.x, r.y, r.w, r.h, radius)
}

function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, rect: Rect, radius: number) {
  ctx.save()
  roundRectPath(ctx, rect, radius)
  ctx.clip()
  const scale = Math.max(rect.w / image.naturalWidth, rect.h / image.naturalHeight)
  const dw = image.naturalWidth * scale
  const dh = image.naturalHeight * scale
  ctx.drawImage(image, rect.x + (rect.w - dw) / 2, rect.y + (rect.h - dh) / 2, dw, dh)
  ctx.restore()
}

function drawSideButtons(ctx: CanvasRenderingContext2D, m: DeviceMetrics, color: string) {
  const { device } = m
  const stick = device.w * 0.014
  const btnW = stick * 2
  const r = stick * 0.6
  ctx.fillStyle = color
  const buttons: Array<[side: 'left' | 'right', topRatio: number, heightRatio: number]> = [
    ['left', 0.155, 0.035], // 操作按钮 / 静音键
    ['left', 0.225, 0.06], // 音量 +
    ['left', 0.3, 0.06], // 音量 -
    ['right', 0.21, 0.1], // 电源键
  ]
  for (const [side, top, height] of buttons) {
    const x = side === 'left' ? device.x - stick : device.x + device.w - stick
    ctx.beginPath()
    ctx.roundRect(x, device.y + device.h * top, btnW, device.h * height, r)
    ctx.fill()
  }
}

function drawDynamicIsland(ctx: CanvasRenderingContext2D, m: DeviceMetrics, color: string) {
  const { screen } = m
  const w = screen.w * 0.29
  const h = screen.w * 0.073
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(screen.x + (screen.w - w) / 2, screen.y + screen.w * 0.025, w, h, h / 2)
  ctx.fill()
}

/** 绘制完整设备：阴影、机身、截图（cover 填充并圆角裁切）、灵动岛 */
export function drawDevice(
  ctx: CanvasRenderingContext2D,
  m: DeviceMetrics,
  frame: FrameConfig,
  image: HTMLImageElement,
) {
  const { device, screen, bodyRadius, screenRadius } = m

  // 投影：先用不透明形状投影，再在其上绘制内容（clip 内的 drawImage 不产生阴影）
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.38)'
  ctx.shadowBlur = device.w * 0.13
  ctx.shadowOffsetY = device.w * 0.06
  ctx.fillStyle = '#000000'
  roundRectPath(ctx, device, bodyRadius)
  ctx.fill()
  ctx.restore()

  if (frame.style === 'realistic') {
    const preset = FRAME_COLORS.find((c) => c.id === frame.colorId) ?? FRAME_COLORS[0]
    drawSideButtons(ctx, m, preset.rim[2])
    // 金属边框
    const rim = ctx.createLinearGradient(device.x, device.y, device.x + device.w, device.y + device.h)
    rim.addColorStop(0, preset.rim[0])
    rim.addColorStop(0.5, preset.rim[1])
    rim.addColorStop(1, preset.rim[2])
    ctx.fillStyle = rim
    roundRectPath(ctx, device, bodyRadius)
    ctx.fill()
    // 黑色屏幕边框（金属圈以内、屏幕以外）
    const rimW = device.w * 0.013
    ctx.fillStyle = preset.bezel
    roundRectPath(
      ctx,
      { x: device.x + rimW, y: device.y + rimW, w: device.w - 2 * rimW, h: device.h - 2 * rimW },
      bodyRadius - rimW,
    )
    ctx.fill()
    drawCoverImage(ctx, image, screen, screenRadius)
    drawDynamicIsland(ctx, m, preset.bezel)
  } else {
    drawCoverImage(ctx, image, screen, screenRadius)
    if (frame.style === 'outline') {
      const color = OUTLINE_COLORS.find((c) => c.id === frame.colorId)?.value ?? '#ffffff'
      ctx.strokeStyle = color
      ctx.lineWidth = device.w * 0.012
      roundRectPath(
        ctx,
        {
          x: screen.x - ctx.lineWidth * 1.2,
          y: screen.y - ctx.lineWidth * 1.2,
          w: screen.w + ctx.lineWidth * 2.4,
          h: screen.h + ctx.lineWidth * 2.4,
        },
        screenRadius + ctx.lineWidth * 1.2,
      )
      ctx.stroke()
    }
  }
}
