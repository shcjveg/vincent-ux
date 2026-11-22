// vincent-ux v1.9.0 · components/react/SectionHeader.tsx
import type { ReactNode } from 'react'
import { DataTime, type DataTimeValue } from './DataTime'
import { Icon } from './Icon'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export function SectionHeader({ title, headingLevel = 3, controls, actions, chatAction, updatedAt }: {
  headingLevel?: HeadingLevel; title?: ReactNode; controls?: ReactNode; actions?: ReactNode; updatedAt?:DataTimeValue
  chatAction?: { label: string; onClick: () => void }
}) {
  const Heading = `h${headingLevel}` as const
  return <header className="vx-card-head">
    <div className="vx-section-heading"><div className="vx-section-title-group">
      {chatAction && <button type="button" className="vx-section-chat vx-icon-btn" data-agent="ask" onClick={chatAction.onClick} aria-label={chatAction.label} title={chatAction.label}><Icon name="chat" size="sm" /></button>}
      {title && <Heading className="vx-title">{title}</Heading>}
    </div>{controls && <div className="vx-section-controls">{controls}</div>}</div>
    {(actions||updatedAt) && <div className="vx-card-extra">{actions}{updatedAt&&<DataTime {...updatedAt}/>}</div>}
  </header>
}
