// vincent-ux v1.5.0 · components/react/SelectionBar.tsx
// 多选后的批量操作条：选中至少一项时浮在结果区底部，左侧已选数量与清除，右侧本次可做的动作。
// 外观见 components/css/molecules.css（.vx-selection-bar），规则见 patterns/browse.md「分页与选择」。
import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

export function SelectionBar({ count, unit = '项', hidden = 0, onClear, children, label = '批量操作' }: {
  /** 已选总数，含当前筛选外的项目；为 0 时不渲染。 */
  count: number
  unit?: string
  /** 已选但被当前筛选隐藏的数量；大于 0 时写明，避免悄悄扩大操作范围。 */
  hidden?: number
  onClear: () => void
  /** 动作按钮：一般用 `.vx-btn`，最多一个 `.vx-btn--primary`，更多动作收进 `ActionMenu`。 */
  children?: ReactNode
  label?: string
}) {
  const shown = count > 0
  // 操作条出现时记下触发选择的元素；清除后操作条消失，焦点回到那里而不是丢到页面开头。
  const origin = useRef<HTMLElement | null>(null)
  useEffect(() => { if (shown) origin.current = document.activeElement as HTMLElement | null }, [shown])
  if (!shown) return null
  const clear = () => {
    onClear()
    const back = origin.current
    requestAnimationFrame(() => { if (back?.isConnected) back.focus() })
  }
  return <div className="vx-selection-bar" role="toolbar" aria-label={label}
    onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); clear() } }}>
    <div className="vx-selection-bar-state">
      <span className="vx-selection-bar-count" role="status" aria-atomic="true">已选 {count} {unit}{hidden > 0 && <span className="vx-selection-bar-hidden">（{hidden} {unit}在筛选外）</span>}</span>
      <button type="button" className="vx-icon-btn vx-selection-bar-clear" aria-label="取消选择" title="取消选择" onClick={clear}><Icon name="close" size="sm" /></button>
    </div>
    {children && <>
      <span className="vx-selection-bar-divider" aria-hidden="true" />
      <div className="vx-selection-bar-actions">{children}</div>
    </>}
  </div>
}
