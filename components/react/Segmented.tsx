// vincent-ux v1.4.2 · components/react/Segmented.tsx
// 分段控件：页内视图切换、三级设置。外观见 .vx-seg
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label?: string }) {
  return (
    <div className="vx-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
