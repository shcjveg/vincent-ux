// vincent-ux v1.5.0 · components/react/Switch.tsx
import type { InputHTMLAttributes, ReactNode } from 'react'

export function Switch({ label, className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & { label: ReactNode }) {
  return <label className={['vx-control-label vx-switch-label', className].filter(Boolean).join(' ')}>
    <input {...props} type="checkbox" role="switch" className="vx-switch-input" />
    <span className="vx-switch" aria-hidden="true" />
    <span>{label}</span>
  </label>
}
