import { useCallback, useState } from 'react'
import type { RenderConfig, ScreenshotItem } from '../types'
import { defaultConfig } from '../constants/presets'

async function loadImage(file: File): Promise<{ image: HTMLImageElement; url: string }> {
  const url = URL.createObjectURL(file)
  const image = new Image()
  image.src = url
  await image.decode()
  return { image, url }
}

export function useScreenshots() {
  const [items, setItems] = useState<ScreenshotItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const accepted = Array.from(files).filter((f) => f.type.startsWith('image/'))
    const loaded: ScreenshotItem[] = []
    for (const file of accepted) {
      try {
        const { image, url } = await loadImage(file)
        loaded.push({ id: crypto.randomUUID(), name: file.name, image, url, config: defaultConfig() })
      } catch {
        // 跳过无法解码的文件
      }
    }
    if (loaded.length === 0) return
    setItems((prev) => {
      // 新图沿用当前整套图的背景与外壳风格，保持风格统一
      const styleSource = prev[0]
      if (styleSource) {
        for (const item of loaded) {
          item.config = {
            ...item.config,
            background: structuredClone(styleSource.config.background),
            frame: { ...styleSource.config.frame },
          }
        }
      }
      return [...prev, ...loaded]
    })
    setSelectedId((prev) => prev ?? loaded[0].id)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.url)
      const next = prev.filter((i) => i.id !== id)
      setSelectedId((sel) => (sel === id ? (next[0]?.id ?? null) : sel))
      return next
    })
  }, [])

  const updateConfig = useCallback((id: string, update: (config: RenderConfig) => RenderConfig) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, config: update(i.config) } : i)))
  }, [])

  /** 把某张图的背景与外壳同步到所有图（文案保持各自独立） */
  const applyStyleToAll = useCallback((sourceId: string) => {
    setItems((prev) => {
      const source = prev.find((i) => i.id === sourceId)
      if (!source) return prev
      return prev.map((i) =>
        i.id === sourceId
          ? i
          : {
              ...i,
              config: {
                ...i.config,
                background: structuredClone(source.config.background),
                frame: { ...source.config.frame },
              },
            },
      )
    })
  }, [])

  const selected = items.find((i) => i.id === selectedId) ?? null
  return { items, selected, setSelectedId, addFiles, removeItem, updateConfig, applyStyleToAll }
}
