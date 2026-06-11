import { useRef } from 'react'
import type { ScreenshotItem } from '../types'

interface Props {
  items: ScreenshotItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onAddFiles: (files: FileList) => void
}

export function ScreenshotList({ items, selectedId, onSelect, onRemove, onAddFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="p-3">
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border border-dashed border-zinc-600 px-3 py-4 text-sm text-zinc-400 transition hover:border-blue-500 hover:text-blue-400"
        >
          ＋ 添加截图
          <span className="mt-1 block text-xs text-zinc-500">支持多选 / 拖拽</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onAddFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition ${
              item.id === selectedId ? 'border-blue-500' : 'border-transparent hover:border-zinc-600'
            }`}
          >
            <img src={item.url} alt={item.name} className="aspect-[9/19] w-full bg-zinc-800 object-cover" />
            <div className="truncate bg-zinc-800/90 px-2 py-1 text-xs text-zinc-400">{item.name}</div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(item.id)
              }}
              title="删除"
              className="absolute right-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-red-600 group-hover:flex"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </aside>
  )
}
