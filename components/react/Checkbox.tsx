// vincent-ux v1.4.1 · components/react/Checkbox.tsx
import { useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label: ReactNode
  indeterminate?: boolean
}
export function Checkbox({ label, indeterminate = false, className, ...props }: CheckboxProps) {
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { if (input.current) input.current.indeterminate = indeterminate }, [indeterminate])
  return <label className="vx-control-label">
    <input {...props} ref={input} type="checkbox" className={['vx-check', className].filter(Boolean).join(' ')} />
    <span>{label}</span>
  </label>
}
