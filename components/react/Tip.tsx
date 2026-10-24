// vincent-ux v1.3.0 · components/react/Tip.tsx
// 提示：基于 Base UI Tooltip。应用根部包一层 <TipProvider>。外观用 .vx-popup.vx-tip
// 依赖：@base-ui/react
import type { ReactElement, ReactNode } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'

export const TipProvider = Tooltip.Provider

export function Tip({ content, children }: { content: ReactNode; children: ReactElement }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6} style={{ zIndex: 'var(--vx-z-popover)' }}>
          <Tooltip.Popup className="vx-popup vx-tip">{content}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
