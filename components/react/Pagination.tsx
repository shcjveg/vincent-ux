// vincent-ux v1.4.2 · components/react/Pagination.tsx
export function Pagination({ page, totalPages, onChange, disabled = false }: {
  page: number; totalPages: number; onChange: (page: number) => void; disabled?: boolean
}) {
  if (totalPages < 2) return null
  const current = Math.max(1, Math.min(page, totalPages))
  const start = Math.max(1, Math.min(current - 2, totalPages - 4))
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i)
  return <nav className="vx-pager" aria-label="分页">
    <button type="button" aria-label="上一页" disabled={disabled || current === 1} onClick={() => onChange(current - 1)}>‹</button>
    {pages.map(p => <button type="button" key={p} disabled={disabled} aria-label={`第 ${p} 页`}
      aria-current={p === current ? 'page' : undefined} onClick={() => onChange(p)}>{p}</button>)}
    <button type="button" aria-label="下一页" disabled={disabled || current === totalPages} onClick={() => onChange(current + 1)}>›</button>
    <span>第 {current} / {totalPages} 页</span>
  </nav>
}
