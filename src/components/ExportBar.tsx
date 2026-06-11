import { useState } from 'react'
import type { ExportSize } from '../types'
import { EXPORT_SIZES } from '../constants/sizes'
import type { ExportFormat } from '../export/exportImages'

interface Props {
  size: ExportSize
  onSizeChange: (size: ExportSize) => void
  format: ExportFormat
  onFormatChange: (format: ExportFormat) => void
  canExport: boolean
  itemCount: number
  onExportCurrent: () => Promise<void>
  onExportAll: () => Promise<void>
}

export function ExportBar({
  size,
  onSizeChange,
  format,
  onFormatChange,
  canExport,
  itemCount,
  onExportCurrent,
  onExportAll,
}: Props) {
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <header className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
      <h1 className="mr-2 text-sm font-bold text-zinc-100">
        AppShot
        <span className="ml-2 hidden font-normal text-zinc-500 sm:inline">App Store 截图生成器 · 本地处理不上传</span>
      </h1>
      <div className="flex-1" />
      <select
        value={size.id}
        onChange={(e) => onSizeChange(EXPORT_SIZES.find((s) => s.id === e.target.value)!)}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
      >
        {EXPORT_SIZES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        value={format}
        onChange={(e) => onFormatChange(e.target.value as ExportFormat)}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
        title="App Store Connect 接受 PNG 与 JPG"
      >
        <option value="png">PNG</option>
        <option value="jpeg">JPG</option>
      </select>
      <button
        disabled={!canExport || busy}
        onClick={() => run(onExportCurrent)}
        className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        导出当前
      </button>
      <button
        disabled={!canExport || busy}
        onClick={() => run(onExportAll)}
        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? '导出中…' : itemCount > 1 ? `导出全部 ${itemCount} 张 (zip)` : '导出全部'}
      </button>
    </header>
  )
}
