// vincent-ux v1.4.2 · components/react/SearchField.tsx
import { useRef, type InputHTMLAttributes } from 'react'
import { Icon } from './Icon'

export function SearchField({ value, onChange, onSearch, label = '搜索', className, onKeyDown, disabled, ...rest }: {
  value: string; onChange: (value: string) => void; onSearch?: (value: string) => void; label?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'size'>) {
  const input = useRef<HTMLInputElement>(null)
  const clear = () => { onChange(''); input.current?.focus() }
  return <div className={['vx-search', className].filter(Boolean).join(' ')}>
    <Icon name="search" />
    <input {...rest} ref={input} type="search" aria-label={label} value={value} disabled={disabled}
      onChange={e => onChange(e.target.value)} onKeyDown={e => {
        onKeyDown?.(e)
        if (e.defaultPrevented || e.nativeEvent.isComposing) return
        if (e.key === 'Escape' && value) { e.preventDefault(); e.stopPropagation(); clear() }
        if (e.key === 'Enter' && onSearch) { e.preventDefault(); onSearch(value) }
      }} />
    {value && <button type="button" className="vx-icon-btn" aria-label={`清空${label}`} disabled={disabled} onClick={clear}>
      <Icon name="close" size="sm" />
    </button>}
  </div>
}
