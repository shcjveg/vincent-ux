// vincent-ux v1.5.0 · components/react/FilterBar.tsx
import type { ReactNode } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'

export type ActiveFilter = { id: string; label: string; onRemove: () => void }
/**
 * side：和筛选项分开布局的一栏（通常是搜索框，下面可跟「清除筛选」）。筛选项在左边换行，
 * 不会挤进这一栏；窄屏下这一栏也不换行，只是收窄。视觉上没有分割线。
 */
export function FilterBar({ children, side, filters = [], onClear, label = '筛选条件' }: {
  children: ReactNode; side?: ReactNode; filters?: ActiveFilter[]; onClear?: () => void; label?: string
}) {
  return <section className="vx-filter-panel" aria-label={label}>
    {side ? <div className="vx-filterbar-row"><div className="vx-filterbar">{children}</div><div className="vx-filterbar-side">{side}</div></div> : <div className="vx-filterbar">{children}</div>}
    {filters.length > 0 && <div className="vx-filterbar" aria-label="已选条件">
      {filters.map(f => <span className="vx-chip" key={f.id}>{f.label}
        <button type="button" aria-label={`移除${f.label}`} onClick={f.onRemove}><Icon name="close" size="sm" /></button>
      </span>)}
      {onClear && <Button variant="ghost" size="sm" onClick={onClear}>清除全部</Button>}
    </div>}
  </section>
}
