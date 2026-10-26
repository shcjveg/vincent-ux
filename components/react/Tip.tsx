// vincent-ux v1.4.0 · components/react/Tip.tsx
// 提示：基于 Base UI Tooltip。应用根部包一层 <TipProvider>。外观用 .vx-popup.vx-tip
// 依赖：@base-ui/react
import { useId, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'

export const TipProvider = Tooltip.Provider

export function Tip({ content, children }: { content: ReactNode; children: ReactElement }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const pinned = useRef(false)
  return (
    <Tooltip.Root open={open} onOpenChange={(next, details) => {
      if (!next && pinned.current && (details.reason === 'trigger-hover' || details.reason === 'trigger-focus')) return
      if (!next) pinned.current = false
      setOpen(next)
    }}>
      <Tooltip.Trigger render={children} aria-describedby={open ? id : undefined} aria-expanded={open} closeOnClick={false} onClick={() => {
        pinned.current = !pinned.current
        setOpen(pinned.current)
      }} />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6} style={{ zIndex: 'var(--vx-z-popover)' }}>
          <Tooltip.Popup id={id} role="tooltip" className="vx-popup vx-tip">{content}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
