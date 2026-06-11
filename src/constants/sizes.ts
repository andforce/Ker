import type { ExportSize } from '../types'

/** App Store Connect 接受的 iPhone 截图尺寸（竖屏） */
export const EXPORT_SIZES: ExportSize[] = [
  {
    id: '1242x2688',
    label: '6.5" · 1242×2688（iPhone XS Max / 11 Pro Max）',
    width: 1242,
    height: 2688,
    group: '6.5英寸',
  },
  {
    id: '1284x2778',
    label: '6.5" · 1284×2778（iPhone 12/13/14 Pro Max 等）',
    width: 1284,
    height: 2778,
    group: '6.5英寸',
  },
  {
    id: '1290x2796',
    label: '6.9" · 1290×2796（iPhone 14/15 Pro Max 等）',
    width: 1290,
    height: 2796,
    group: '6.9英寸',
  },
  {
    id: '1320x2868',
    label: '6.9" · 1320×2868（iPhone 16 Pro Max 等）',
    width: 1320,
    height: 2868,
    group: '6.9英寸',
  },
]

export const DEFAULT_SIZE_ID = '1284x2778'
