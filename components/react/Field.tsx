// vincent-ux v1.4.2 · components/react/Field.tsx
import { useId, type ReactNode } from 'react'

type ControlProps = { id: string; required?: boolean; 'aria-describedby'?: string; 'aria-invalid'?: true }
export function Field({ label, hint, error, required, id: givenId, children }: {
  label: ReactNode; hint?: ReactNode; error?: string; required?: boolean; id?: string
  children: (control: ControlProps) => ReactNode
}) {
  const generatedId = useId()
  const id = givenId ?? generatedId
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return <div className="vx-field">
    <label className="vx-field-label" htmlFor={id} data-required={required || undefined}>{label}</label>
    {children({ id, required, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
    {hint && <p id={`${id}-hint`} className="vx-field-help">{hint}</p>}
    {error && <p id={`${id}-error`} className="vx-field-error" role="alert">{error}</p>}
  </div>
}
