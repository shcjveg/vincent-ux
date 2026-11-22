// vincent-ux v1.9.0 · components/react/Tip.tsx
// 提示：基于 Base UI Tooltip。应用根部包一层 <TipProvider>。外观用 .vx-popup.vx-tip
// 说明型触发器（自身没有点击动作，如信息图标）点击固定、再次点击收起；动作按钮（自带 onClick）只在悬停、聚焦时提示，点击执行动作并收起。
// 依赖：@base-ui/react
import { useThemeContainer } from './ThemeScope'
import { useId, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'

export const TipProvider = Tooltip.Provider

export function Tip({ content, children }: { content: ReactNode; children: ReactElement }) {
  const container = useThemeContainer()
  const id = useId()
  const [open, setOpen] = useState(false)
  const pinned = useRef(false)
  const action = typeof (children.props as { onClick?: unknown }).onClick === 'function'
  return (
    <Tooltip.Root open={open} onOpenChange={(next, details) => {
      if (!next && pinned.current && (details.reason === 'trigger-hover' || details.reason === 'trigger-focus')) return
      if (!next) pinned.current = false
      setOpen(next)
    }}>
      <Tooltip.Trigger render={children} aria-describedby={open ? id : undefined} aria-expanded={open} closeOnClick={action} onClick={() => {
        if (action) { pinned.current = false; setOpen(false); return }
        pinned.current = !pinned.current
        setOpen(pinned.current)
      }} />
      <Tooltip.Portal container={container}>
        <Tooltip.Positioner sideOffset={6} style={{ zIndex: 'var(--vx-z-popover)' }}>
          <Tooltip.Popup id={id} role="tooltip" className="vx-popup vx-tip">{content}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
