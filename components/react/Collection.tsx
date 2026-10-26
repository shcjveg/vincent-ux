// vincent-ux v1.4.3 · components/react/Collection.tsx
import type { Key, ReactNode } from 'react'
import { EmptyState } from './EmptyState'
import { Button } from './Button'

// 只承接呈现与反馈；排序、筛选、选择、分页及请求状态由消费方控制。
export function Collection<T>({ items, getKey, renderItem, layout = 'list', label = '结果', loading = false,
  error, onRetry, emptyTitle = '暂无内容', emptyDescription = '添加第一项后会显示在这里。', emptyAction, total = items.length, actions }: {
  items: T[]; getKey: (item: T) => Key; renderItem: (item: T) => ReactNode
  layout?: 'list' | 'grid'; label?: string; loading?: boolean; error?: string; onRetry?: () => void
  emptyTitle?: string; emptyDescription?: string; emptyAction?: ReactNode; total?: number; actions?:ReactNode
}) {
  return <section className="vx-collection" aria-label={label} aria-busy={loading}>
    <div className="vx-results-head"><p className="vx-meta" role="status" aria-atomic="true">{loading ? '正在更新结果…' : error ? '结果更新失败' : `共 ${total} 项`}</p>{actions}</div>
    {error && <div className="vx-empty"><p role="alert">{error}</p>{onRetry && <Button onClick={onRetry} disabled={loading}>重试</Button>}</div>}
    {!error && items.length === 0 && (loading
      ? <div className="vx-stack" aria-hidden="true"><div className="vx-skeleton" /><div className="vx-skeleton" /><div className="vx-skeleton" /></div>
      : <EmptyState message={emptyTitle} description={emptyDescription} action={emptyAction}/>)}
    {items.length > 0 && <ul className={`vx-browse-${layout}`} aria-label={label}>
      {items.map(item => <li className="vx-browse-item" key={getKey(item)}>{renderItem(item)}</li>)}
    </ul>}
  </section>
}
