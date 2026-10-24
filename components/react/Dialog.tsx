// vincent-ux v1.3.0 · components/react/Dialog.tsx
import { Dialog as D } from '@base-ui/react/dialog'
import type { ReactElement, ReactNode } from 'react'
import { Icon } from './Icon'

// 两种外观共用 Base UI 的模态、Esc 与焦点恢复行为。
export function Dialog({ open, onOpenChange, trigger, title, description, children, actions,
  variant = 'dialog', initialFocus, finalFocus, dismissible = true }: {
  open: boolean; onOpenChange: (open: boolean) => void; trigger?: ReactElement
  title: string; description?: string; children?: ReactNode; actions?: ReactNode
  variant?: 'dialog' | 'drawer'; initialFocus?: D.Popup.Props['initialFocus']; finalFocus?: D.Popup.Props['finalFocus']
  dismissible?: boolean
}) {
  return <D.Root modal open={open} onOpenChange={onOpenChange} disablePointerDismissal={!dismissible}>
    {trigger && <D.Trigger render={trigger} />}
    <D.Portal>
      <D.Backdrop className="vx-scrim" />
      <D.Popup aria-modal="true" className={variant === 'drawer' ? 'vx-drawer' : 'vx-dialog'} initialFocus={initialFocus} finalFocus={finalFocus}>
        <div className="vx-overlay-head">
          <D.Title className="vx-title">{title}</D.Title>
          <D.Close className="vx-icon-btn" aria-label={`关闭${title}`}><Icon name="close" /></D.Close>
        </div>
        <div className="vx-overlay-body">
          {description && <D.Description className="vx-body">{description}</D.Description>}
          {children}
        </div>
        {actions && <div className="vx-overlay-foot">{actions}</div>}
      </D.Popup>
    </D.Portal>
  </D.Root>
}
