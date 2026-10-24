// vincent-ux v1.3.0 · components/react/RadioGroup.tsx
import type { ReactNode } from 'react'

export function RadioGroup<T extends string>({ label, name, value, options, onChange, disabled, required }: {
  label: ReactNode; name: string; value: T | null
  options: { value: T; label: string; disabled?: boolean }[]
  onChange: (value: T) => void; disabled?: boolean; required?: boolean
}) {
  return <fieldset className="vx-radio-group" disabled={disabled}>
    <legend className="vx-field-label">{label}</legend>
    {options.map(option => <label key={option.value} className="vx-control-label">
      <input type="radio" className="vx-radio" name={name} value={option.value} checked={value === option.value}
        disabled={option.disabled} required={required} onChange={() => onChange(option.value)} />
      <span>{option.label}</span>
    </label>)}
  </fieldset>
}
