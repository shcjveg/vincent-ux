// vincent-ux v1.4.3 · components/react/EmptyState.tsx
import type { ReactNode } from 'react'

/** A shared empty state for a section or a full results page. */
export function EmptyState({message, description, action, icon, variant='section'}:{message:ReactNode;description?:ReactNode;action?:ReactNode;icon?:ReactNode;variant?:'section'|'page'}) {
  return <div className={`vx-empty-state vx-empty-state--${variant}`}>
    {variant==='page'&&icon&&<span className="vx-empty-state-icon" aria-hidden="true">{icon}</span>}
    <p className="vx-empty-state-message">{message}</p>
    {description&&<p className="vx-empty-state-description">{description}</p>}
    {action&&<div className="vx-empty-state-action">{action}</div>}
  </div>
}
