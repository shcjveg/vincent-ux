// vincent-ux v1.5.0 · components/react/ActionSummary.tsx
import { Icon } from './Icon'

/** Group related name/count/action; only actionable urgency receives a dot. */
export function ActionSummary({ items }: { items: { id: string; label: string; count: number; urgentCount?: number; onSelect: () => void }[] }) {
  return <div className="vx-action-grid">{items.map(item => <button type="button" key={item.id} className="vx-action-grid-item" data-entry data-urgent={!!item.urgentCount || undefined} disabled={!item.count} onClick={item.onSelect} aria-label={`${item.label}，${item.count} 项${item.urgentCount ? `，其中 ${item.urgentCount} 项需及时处理` : ''}`}>
    <span className="vx-action-grid-label">{item.label}{!!item.urgentCount && <span className="vx-dot" aria-hidden="true" />}</span>
    <span className="vx-action-grid-value"><strong>{item.count}</strong><span>项</span>{item.count > 0 && <Icon name="next" size="sm" />}</span>
  </button>)}</div>
}
