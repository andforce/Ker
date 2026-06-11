export interface ExportSize {
  id: string
  /** 设备说明，如 6.5" (iPhone 11 Pro Max 等) */
  label: string
  width: number
  height: number
  group: '6.5英寸' | '6.9英寸'
}

export type FrameStyle = 'realistic' | 'outline' | 'screen-only'

export interface FrameConfig {
  style: FrameStyle
  /** 真实外壳的配色预设 id，或描边样式的颜色 */
  colorId: string
}

export interface BackgroundConfig {
  type: 'gradient' | 'solid'
  /** 渐变色标（1~3 个）；solid 时取第一个 */
  colors: string[]
  /** 渐变角度（度），0 为从下到上 */
  angle: number
}

export type TextPosition = 'top' | 'bottom'

export interface TextConfig {
  title: string
  subtitle: string
  color: string
  position: TextPosition
  /** 字号缩放倍数，1 为默认 */
  scale: number
}

export interface RenderConfig {
  background: BackgroundConfig
  frame: FrameConfig
  text: TextConfig
}

export interface ScreenshotItem {
  id: string
  name: string
  image: HTMLImageElement
  /** 缩略图用的 object URL */
  url: string
  config: RenderConfig
}
