// vincent-ux v1.9.0 · components/react/Segmented.tsx
// 分段控件：页内视图切换、三级设置。外观见 .vx-seg
import type { CSSProperties } from 'react'

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label?: string }) {
  const index = options.findIndex(option => option.id === value)
  return (
    <div className="vx-seg vx-seg--switch" role="group" aria-label={label} data-selected={index >= 0 || undefined}
      style={{ '--vx-segment': index } as CSSProperties}>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
