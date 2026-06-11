import { useCallback, useRef, useState } from 'react'
import { useScreenshots } from './hooks/useScreenshots'
import { EXPORT_SIZES, DEFAULT_SIZE_ID } from './constants/sizes'
import { exportAllAsZip, exportSingle, type ExportFormat } from './export/exportImages'
import { ScreenshotList } from './components/ScreenshotList'
import { PreviewCanvas } from './components/PreviewCanvas'
import { EditorPanel } from './components/EditorPanel'
import { ExportBar } from './components/ExportBar'

export default function App() {
  const { items, selected, setSelectedId, addFiles, removeItem, updateConfig, applyStyleToAll } = useScreenshots()
  const [size, setSize] = useState(EXPORT_SIZES.find((s) => s.id === DEFAULT_SIZE_ID)!)
  const [format, setFormat] = useState<ExportFormat>('png')
  const [dragging, setDragging] = useState(false)
  const dragDepth = useRef(0)
  const emptyInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragDepth.current = 0
      setDragging(false)
      if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files)
    },
    [addFiles],
  )

  return (
    <div
      className="flex h-screen flex-col bg-zinc-950 text-zinc-100"
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => {
        e.preventDefault()
        dragDepth.current += 1
        setDragging(true)
      }}
      onDragLeave={() => {
        dragDepth.current -= 1
        if (dragDepth.current <= 0) setDragging(false)
      }}
      onDrop={onDrop}
    >
      <ExportBar
        size={size}
        onSizeChange={setSize}
        format={format}
        onFormatChange={setFormat}
        canExport={items.length > 0}
        itemCount={items.length}
        onExportCurrent={async () => {
          if (selected) await exportSingle(selected, size, format, items.indexOf(selected))
        }}
        onExportAll={async () => {
          if (items.length === 1) await exportSingle(items[0], size, format, 0)
          else if (items.length > 1) await exportAllAsZip(items, size, format)
        }}
      />
      <div className="flex min-h-0 flex-1">
        {items.length > 0 && (
          <ScreenshotList
            items={items}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            onRemove={removeItem}
            onAddFiles={(files) => void addFiles(files)}
          />
        )}
        <main className="min-w-0 flex-1 bg-zinc-950">
          {selected ? (
            <PreviewCanvas item={selected} size={size} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <button
                onClick={() => emptyInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-zinc-700 px-16 py-20 text-center transition hover:border-blue-500"
              >
                <div className="text-4xl">📱</div>
                <div className="mt-4 text-lg font-medium text-zinc-200">拖拽或点击上传 iPhone 截图</div>
                <div className="mt-2 max-w-sm text-sm text-zinc-500">
                  任意尺寸均可（如 iPhone 12 Pro 的 1179×2556）。
                  <br />
                  生成符合 App Store Connect 要求的 6.5" / 6.9" 宣传截图，
                  <br />
                  全部在浏览器本地完成，不会上传你的截图。
                </div>
              </button>
              <input
                ref={emptyInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) void addFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>
          )}
        </main>
        {selected && (
          <EditorPanel
            item={selected}
            multiple={items.length > 1}
            onChange={(update) => updateConfig(selected.id, update)}
            onApplyToAll={() => applyStyleToAll(selected.id)}
          />
        )}
      </div>
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-dashed border-blue-400 px-12 py-8 text-lg font-medium text-blue-200">
            松开以添加截图
          </div>
        </div>
      )}
    </div>
  )
}
