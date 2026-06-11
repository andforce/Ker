import type { BackgroundConfig, RenderConfig } from '../types'

export interface GradientPreset {
  id: string
  name: string
  background: BackgroundConfig
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'violet', name: '极光紫', background: { type: 'gradient', colors: ['#667eea', '#764ba2'], angle: 135 } },
  { id: 'ocean', name: '深海蓝', background: { type: 'gradient', colors: ['#30cfd0', '#330867'], angle: 160 } },
  { id: 'sunset', name: '暖阳橙', background: { type: 'gradient', colors: ['#f6d365', '#fda085'], angle: 135 } },
  { id: 'peach', name: '蜜桃粉', background: { type: 'gradient', colors: ['#ff9a9e', '#fad0c4'], angle: 135 } },
  { id: 'mint', name: '青柠绿', background: { type: 'gradient', colors: ['#43e97b', '#38f9d7'], angle: 135 } },
  { id: 'sakura', name: '樱花紫', background: { type: 'gradient', colors: ['#fbc2eb', '#a6c1ee'], angle: 135 } },
  { id: 'graphite', name: '石墨黑', background: { type: 'gradient', colors: ['#0f2027', '#203a43', '#2c5364'], angle: 135 } },
  { id: 'night', name: '暗夜灰', background: { type: 'gradient', colors: ['#232526', '#414345'], angle: 135 } },
]

export interface FrameColorPreset {
  id: string
  name: string
  /** 机身金属边框的渐变色（左→右） */
  rim: [string, string, string]
  /** 灵动岛与屏幕黑边颜色 */
  bezel: string
}

export const FRAME_COLORS: FrameColorPreset[] = [
  { id: 'space-black', name: '深空黑', rim: ['#3a3a3c', '#6e6e73', '#2c2c2e'], bezel: '#000000' },
  { id: 'titanium', name: '原色钛', rim: ['#8a8378', '#c9c2b6', '#7a7468'], bezel: '#000000' },
  { id: 'silver', name: '银色', rim: ['#c8c8cc', '#f2f2f5', '#b4b4b8'], bezel: '#000000' },
  { id: 'gold', name: '金色', rim: ['#cdb287', '#ecd9b6', '#b89b6f'], bezel: '#000000' },
]

/** 描边/无外壳样式下可选的描边颜色 */
export const OUTLINE_COLORS = [
  { id: 'white', name: '白色', value: '#ffffff' },
  { id: 'black', name: '黑色', value: '#111111' },
]

export function defaultConfig(): RenderConfig {
  return {
    background: { ...GRADIENT_PRESETS[0].background, colors: [...GRADIENT_PRESETS[0].background.colors] },
    frame: { style: 'realistic', colorId: 'space-black' },
    text: { title: '', subtitle: '', color: '#ffffff', position: 'top', scale: 1 },
  }
}
