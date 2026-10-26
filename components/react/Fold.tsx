// vincent-ux v1.4.1 · components/react/Fold.tsx
// 内容收纳：分组、对象详情与编辑区共用此结构。外观见 components/css/molecules.css（.vx-fold*）
// 数量与箭头表达折叠；分组摘要和草稿策略由宿主控制，见 components/disclosure.md。
import { useId, useState, type HTMLAttributes, type ReactNode } from 'react'
import { Icon } from './Icon'

type FoldProps = {
  summary: ReactNode
  description?: ReactNode
  count?: ReactNode
  side?: ReactNode
  children?: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: 'section' | 'row'
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>

export function Fold({ summary, description, count, side, children, defaultOpen = false, open: openProp, onOpenChange, variant = 'section', className, ...rest }: FoldProps) {
  const [inner, setInner] = useState(defaultOpen)
  const open = openProp ?? inner
  const id = useId()
  const toggle = () => {
    if (openProp === undefined) setInner(!open)
    onOpenChange?.(!open)
  }
  return (
    <div {...rest} className={['vx-fold', variant === 'row' && 'vx-fold--row', className].filter(Boolean).join(' ')} data-open={open}>
      <button type="button" className="vx-fold-head" aria-expanded={open} aria-controls={id} onClick={toggle}>
        <span className="vx-fold-summary">
          <span className={variant === 'row' ? 'vx-fold-title' : undefined}>{summary}</span>
          {description && <span className="vx-fold-description">{description}</span>}
        </span>
        {side != null && <span className="vx-fold-side">{side}</span>}
        <span className="vx-fold-act">
          {count != null && <span className="vx-count">{count}</span>}
          <span className="vx-sr-only">{open ? '收起' : '展开'}</span>
          <Icon name="expand" size="sm" />
        </span>
      </button>
      {children != null && (
        <div id={id} className="vx-fold-body" hidden={!open}>
          {children}
        </div>
      )}
    </div>
  )
}
