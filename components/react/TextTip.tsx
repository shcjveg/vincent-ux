// vincent-ux v1.4.2 · components/react/TextTip.tsx
import type { ReactNode } from 'react'
import { Tip } from './Tip'

/** The label itself explains how to reveal contextual help. */
export function TextTip({ label, content, accessibleLabel }: { label: string; content: ReactNode; accessibleLabel?: string }) {
  return <Tip content={content}><button type="button" className="vx-tip-label" aria-label={accessibleLabel ?? `${label}说明`}>{label}</button></Tip>
}
