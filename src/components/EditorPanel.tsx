import type { BackgroundConfig, RenderConfig, ScreenshotItem } from '../types'
import { FRAME_COLORS, GRADIENT_PRESETS, OUTLINE_COLORS } from '../constants/presets'

interface Props {
  item: ScreenshotItem
  multiple: boolean
  onChange: (update: (config: RenderConfig) => RenderConfig) => void
  onApplyToAll: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-zinc-800 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-lg bg-zinc-800 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-md px-2 py-1.5 text-xs transition ${
            value === opt.value ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function backgroundCss(bg: BackgroundConfig): string {
  if (bg.type === 'solid' || bg.colors.length === 1) return bg.colors[0]
  return `linear-gradient(${bg.angle}deg, ${bg.colors.join(', ')})`
}

export function EditorPanel({ item, multiple, onChange, onApplyToAll }: Props) {
  const { frame, background, text } = item.config
  const set = onChange

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-zinc-800 bg-zinc-900">
      <Section title="手机外壳">
        <SegmentedControl
          value={frame.style}
          options={[
            { value: 'realistic', label: '真实外壳' },
            { value: 'outline', label: '极简描边' },
            { value: 'screen-only', label: '无外壳' },
          ]}
          onChange={(style) =>
            set((c) => ({
              ...c,
              frame: { style, colorId: style === 'realistic' ? FRAME_COLORS[0].id : OUTLINE_COLORS[0].id },
            }))
          }
        />
        {frame.style === 'realistic' && (
          <div className="flex gap-2">
            {FRAME_COLORS.map((color) => (
              <button
                key={color.id}
                title={color.name}
                onClick={() => set((c) => ({ ...c, frame: { ...c.frame, colorId: color.id } }))}
                className={`h-8 w-8 rounded-full border-2 ${
                  frame.colorId === color.id ? 'border-blue-500' : 'border-zinc-700'
                }`}
                style={{ background: `linear-gradient(135deg, ${color.rim[0]}, ${color.rim[1]}, ${color.rim[2]})` }}
              />
            ))}
          </div>
        )}
        {frame.style === 'outline' && (
          <div className="flex gap-2">
            {OUTLINE_COLORS.map((color) => (
              <button
                key={color.id}
                title={color.name}
                onClick={() => set((c) => ({ ...c, frame: { ...c.frame, colorId: color.id } }))}
                className={`h-8 w-8 rounded-full border-2 ${
                  frame.colorId === color.id ? 'border-blue-500' : 'border-zinc-700'
                }`}
                style={{ background: color.value }}
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="背景">
        <div className="grid grid-cols-4 gap-2">
          {GRADIENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              title={preset.name}
              onClick={() => set((c) => ({ ...c, background: structuredClone(preset.background) }))}
              className="aspect-square rounded-lg border border-zinc-700 transition hover:scale-105"
              style={{ background: backgroundCss(preset.background) }}
            />
          ))}
        </div>
        <SegmentedControl
          value={background.type}
          options={[
            { value: 'gradient', label: '渐变' },
            { value: 'solid', label: '纯色' },
          ]}
          onChange={(type) =>
            set((c) => ({
              ...c,
              background:
                type === 'gradient'
                  ? { type, colors: [c.background.colors[0], c.background.colors[1] ?? '#764ba2'], angle: c.background.angle }
                  : { type, colors: [c.background.colors[0]], angle: c.background.angle },
            }))
          }
        />
        <div className="flex items-center gap-2">
          {background.colors.map((color, i) => (
            <input
              key={i}
              type="color"
              value={color}
              onChange={(e) =>
                set((c) => ({
                  ...c,
                  background: {
                    ...c.background,
                    colors: c.background.colors.map((cc, ci) => (ci === i ? e.target.value : cc)),
                  },
                }))
              }
              className="h-8 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
            />
          ))}
          {background.type === 'gradient' && (
            <label className="flex flex-1 items-center gap-2 text-xs text-zinc-400">
              角度
              <input
                type="range"
                min={0}
                max={360}
                value={background.angle}
                onChange={(e) => set((c) => ({ ...c, background: { ...c.background, angle: +e.target.value } }))}
                className="flex-1"
              />
            </label>
          )}
        </div>
      </Section>

      <Section title="营销文案">
        <input
          type="text"
          placeholder="标题（如：一键连接，畅享网络）"
          value={text.title}
          onChange={(e) => set((c) => ({ ...c, text: { ...c.text, title: e.target.value } }))}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="副标题（可选）"
          value={text.subtitle}
          onChange={(e) => set((c) => ({ ...c, text: { ...c.text, subtitle: e.target.value } }))}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <SegmentedControl
            value={text.position}
            options={[
              { value: 'top', label: '文字在上' },
              { value: 'bottom', label: '文字在下' },
            ]}
            onChange={(position) => set((c) => ({ ...c, text: { ...c.text, position } }))}
          />
          <input
            type="color"
            title="文字颜色"
            value={text.color}
            onChange={(e) => set((c) => ({ ...c, text: { ...c.text, color: e.target.value } }))}
            className="h-8 w-10 shrink-0 cursor-pointer rounded border border-zinc-700 bg-transparent"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          字号
          <input
            type="range"
            min={0.6}
            max={1.6}
            step={0.05}
            value={text.scale}
            onChange={(e) => set((c) => ({ ...c, text: { ...c.text, scale: +e.target.value } }))}
            className="flex-1"
          />
        </label>
      </Section>

      {multiple && (
        <div className="p-4">
          <button
            onClick={onApplyToAll}
            className="w-full rounded-lg bg-zinc-700 px-3 py-2 text-sm text-zinc-100 transition hover:bg-zinc-600"
          >
            将背景与外壳应用到全部
          </button>
          <p className="mt-2 text-center text-xs text-zinc-500">文案保持每张图独立</p>
        </div>
      )}
    </aside>
  )
}
