// vincent-ux v1.8.0 · components/react/PalettePicker.tsx
import { useId } from 'react'
import { Icon } from './Icon'
import { Select } from './Select'

export type PaletteOption = { id: string; name: string; swatches?: readonly string[] }
export type PalettePickerProps = {
  options: readonly PaletteOption[]
  value: string
  onChange: (id: string) => void
  variant?: 'grid' | 'compact'
  label?: string
  id?: string
}

// 两种选项共用候选主题作用域。在 CSS 中解析颜色，使未选中的主题也能跟随当前明暗。
function PaletteSample({ option, compact = false }: { option: PaletteOption; compact?: boolean }) {
  return <span className={'vx-theme ' + (compact ? 'vx-palette-band' : 'vx-palette-sample')} data-palette={option.id} aria-hidden="true">
    <span className="vx-palette-rail">
      <span className="vx-palette-identity" />
      {!compact && <span className="vx-palette-nav-lines"><i /><i /></span>}
    </span>
    <span className="vx-palette-page">
      {!compact && <span className="vx-palette-heading">{option.name}<span className="vx-palette-check"><Icon name="done" size="sm" /></span></span>}
      <span className="vx-palette-content">
        {!compact && <span className="vx-palette-reading">正文</span>}
        <span className="vx-palette-action">{!compact && '主操作'}</span>
      </span>
    </span>
  </span>
}

export function PalettePicker({ options, value, onChange, variant = 'grid', label = '配色主题', id }: PalettePickerProps) {
  const groupName = useId()
  if (variant === 'compact') {
    const byId = new Map(options.map(option => [option.id, option]))
    return <Select id={id} className="vx-palette-trigger" label={label} value={value} onChange={onChange}
      options={options.map(option => ({ value: option.id, label: option.name }))}
      renderLabel={item => {
        const option = byId.get(item.value)
        return option ? <span className="vx-palette-label"><PaletteSample option={option} compact /><span>{option.name}</span></span> : item.label
      }} />
  }
  return <div id={id} className="vx-palette-grid" role="radiogroup" aria-label={label}>
    {options.map(option => <label key={option.id} className="vx-palette-option" id={id && id + '-' + option.id}>
      <input type="radio" name={groupName} value={option.id} checked={option.id === value}
        aria-label={option.name} onChange={() => onChange(option.id)} />
      <PaletteSample option={option} />
    </label>)}
  </div>
}
