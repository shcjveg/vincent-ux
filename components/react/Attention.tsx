// vincent-ux v1.4.2 · components/react/Attention.tsx
import type { ReactNode } from 'react'

/** Entry dots guide navigation; endpoint corners and section counts identify actual pending work. */
export function Attention({ count, corner = false, label = '待处理' }: { count?: number; corner?: boolean; label?: string }) {
  if (count !== undefined && count <= 0) return null
  return count === undefined
    ? <span role="img" className={corner ? "vx-dot vx-attention-corner" : "vx-dot"} data-attention={corner ? "endpoint" : undefined} aria-label={label} />
    : <span role="img" className="vx-badge vx-attention-count" aria-label={`${count} 项${label}`}>{count}</span>
}
export function AttentionTitle({ children, count }: { children: ReactNode; count?: number }) {
  return <span className="vx-attention-title" data-attention="section"><span className="vx-attention-label">{children}</span>{count !== undefined && <Attention count={count} />}</span>
}
