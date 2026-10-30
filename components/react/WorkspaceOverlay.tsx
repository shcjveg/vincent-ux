// vincent-ux v1.5.0 · components/react/WorkspaceOverlay.tsx
import { Dialog } from '@base-ui/react/dialog'
import { type ReactNode } from 'react'

/** A workspace panel becomes a modal surface when the inline layout no longer fits. */
export function WorkspaceOverlay({ active, open, onOpenChange, label, variant = 'panel', children, initialFocus, finalFocus }: {
  active: boolean; open: boolean; onOpenChange: (open: boolean) => void; label: string
  variant?: 'panel' | 'nav'; children: ReactNode
  initialFocus?: Dialog.Popup.Props['initialFocus']; finalFocus?: Dialog.Popup.Props['finalFocus']
}) {
  if (!active) return children
  return <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
    <Dialog.Portal>
      <Dialog.Backdrop className="vx-scrim" />
      <Dialog.Popup className={`vx-workspace-overlay vx-workspace-overlay--${variant}`} aria-label={label} initialFocus={initialFocus} finalFocus={finalFocus}>
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
}
