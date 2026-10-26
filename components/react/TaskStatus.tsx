// vincent-ux v1.4.1 · components/react/TaskStatus.tsx
import { Icon } from './Icon'
export type TaskTimestamp={label:string;dateTime:string;text:string;detail?:string;suffix?:string}
export function TaskStatus({type,urgency,timestamps=[]}:{type:string;urgency:{label:string;due?:string;urgent?:boolean};timestamps?:TaskTimestamp[]}){
 return <div className="vx-task-status" aria-label="事项状态">
  <span className="vx-task-status-main"><span className="vx-task-status-type" data-status-part="type" title={type}>{type}</span>
  <span data-status-part="urgency" className="vx-due" data-urgent={urgency.urgent||undefined}><Icon name="pending" size="sm"/><span className="vx-task-status-urgency-text" title={[urgency.label,urgency.due].filter(Boolean).join(' · ')}>{urgency.label}{urgency.due&&` · ${urgency.due}`}</span></span>
  </span><span className="vx-task-status-times" data-status-part="timestamps">{timestamps.map(t=><time key={t.label} dateTime={t.dateTime} title={t.detail} aria-label={`${t.label} ${t.detail??t.text} ${t.suffix??""}`}>{t.label} {t.text}{t.suffix&&` ${t.suffix}`}</time>)}</span>
 </div>
}
