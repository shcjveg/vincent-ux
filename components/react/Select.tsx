// vincent-ux v1.3.0 · components/react/Select.tsx
import { Select as S } from '@base-ui/react/select'
import type { AriaAttributes, Ref } from 'react'
import { Icon } from './Icon'

export type SelectOption<T extends string> = { value: T; label: string; hint?: string; disabled?: boolean }
export type SelectProps<T extends string> = AriaAttributes & {
  value: T | null; options: SelectOption<T>[]; onChange: (value: T) => void
  label?: string; placeholder?: string; disabled?: boolean; required?: boolean; readOnly?: boolean
  name?: string; id?: string; form?: string; className?: string; ref?: Ref<HTMLButtonElement>
}
export function Select<T extends string>({ value, options, onChange, label, placeholder = '请选择', disabled,
  required, readOnly, name, id, form, className, ref, ...aria }: SelectProps<T>) {
  return <S.Root value={value} items={options} onValueChange={v => { if (v != null) onChange(v) }}
    disabled={disabled} required={required} readOnly={readOnly} name={name} id={id} form={form}>
    <S.Trigger {...aria} ref={ref} id={id} className={['vx-trigger', className].filter(Boolean).join(' ')} aria-label={label ?? aria['aria-label']}>
      <S.Value placeholder={placeholder} />
      <S.Icon><Icon name="expand" size="sm" /></S.Icon>
    </S.Trigger>
    <S.Portal>
      <S.Positioner side="bottom" align="start" sideOffset={6} alignItemWithTrigger={false} style={{ zIndex: 'var(--vx-z-popover)' }}>
        <S.Popup className="vx-popup">
          <S.List>
            {options.length === 0 && <div className="vx-option-hint" role="status">暂无可选项</div>}
            {options.map(o => <S.Item key={o.value} value={o.value} disabled={o.disabled} className="vx-option">
              <span className="vx-option-check"><S.ItemIndicator><Icon name="done" size="sm" /></S.ItemIndicator></span>
              <span><S.ItemText>{o.label}</S.ItemText>{o.hint && <span className="vx-option-hint">{o.hint}</span>}</span>
            </S.Item>)}
          </S.List>
        </S.Popup>
      </S.Positioner>
    </S.Portal>
  </S.Root>
}
