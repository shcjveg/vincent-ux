// vincent-ux v1.4.2 · components/react/SectionHeader.tsx
import type { ReactNode } from 'react'
import { DataTime, type DataTimeValue } from './DataTime'
import { Icon } from './Icon'

export function SectionHeader({ title, controls, actions, chatAction, updatedAt }: {
  title?: ReactNode; controls?: ReactNode; actions?: ReactNode; updatedAt?:DataTimeValue
  chatAction?: { label: string; onClick: () => void }
}) {
  return <header className="vx-card-head">
    <div className="vx-section-heading"><div className="vx-section-title-group">
      {chatAction && <button type="button" className="vx-section-chat vx-icon-btn" data-agent="ask" onClick={chatAction.onClick} aria-label={chatAction.label} title={chatAction.label}><Icon name="chat" size="sm" /></button>}
      {title && <h3>{title}</h3>}
    </div>{controls && <div className="vx-section-controls">{controls}</div>}</div>
    {(actions||updatedAt) && <div className="vx-card-extra">{actions}{updatedAt&&<DataTime {...updatedAt}/>}</div>}
  </header>
}
