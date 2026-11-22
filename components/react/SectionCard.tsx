// vincent-ux v1.7.0 · components/react/SectionCard.tsx
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import type { DataTimeValue } from './DataTime'
import { Attention } from './Attention'
import { SectionHeader, type HeadingLevel } from './SectionHeader'

/** One surface for one section; controls and actions use the shared header. */
export function SectionCard({ title, headingLevel, controls, actions, chatAction, updatedAt, attention, children, className = '', ...rest }: Omit<ComponentPropsWithoutRef<'section'>, 'title'> & {
  headingLevel?: HeadingLevel; attention?: boolean; title?: ReactNode; controls?: ReactNode; actions?: ReactNode; updatedAt?:DataTimeValue
  chatAction?: { label: string; onClick: () => void }
}) {
  const header = title || controls || actions || chatAction || updatedAt
  return <section {...rest} className={`vx-card vx-section-card ${className}`}>
    {attention && <Attention corner />}
    {header && <SectionHeader headingLevel={headingLevel} title={title} controls={controls} actions={actions} chatAction={chatAction} updatedAt={updatedAt} />}
    <div className={`vx-card-body${header ? '' : ' vx-card-body--standalone'}`}>{children}</div>
  </section>
}

export function SectionAction({ children, className = '', ...props }: ComponentPropsWithoutRef<'button'>) {
  return <button type="button" {...props} className={`vx-section-action ${className}`}>{children}</button>
}
