// vincent-ux v1.4.1 · components/react/FilterBar.tsx
import type { ReactNode } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'

export type ActiveFilter = { id: string; label: string; onRemove: () => void }
export function FilterBar({ children, filters = [], onClear, label = '筛选条件' }: {
  children: ReactNode; filters?: ActiveFilter[]; onClear?: () => void; label?: string
}) {
  return <section className="vx-filter-panel" aria-label={label}>
    <div className="vx-filterbar">{children}</div>
    {filters.length > 0 && <div className="vx-filterbar" aria-label="已选条件">
      {filters.map(f => <span className="vx-chip" key={f.id}>{f.label}
        <button type="button" aria-label={`移除${f.label}`} onClick={f.onRemove}><Icon name="close" size="sm" /></button>
      </span>)}
      {onClear && <Button variant="ghost" size="sm" onClick={onClear}>清除全部</Button>}
    </div>}
  </section>
}
