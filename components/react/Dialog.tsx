// vincent-ux v1.4.2 · components/react/Dialog.tsx
import { Dialog as D } from '@base-ui/react/dialog'
import type { ReactElement, ReactNode } from 'react'
import { Icon } from './Icon'

// 三种外观共用 Base UI 的模态、Esc 与焦点恢复行为。
export function Dialog({ open, onOpenChange, trigger, title, description, children, actions,
  variant = 'dialog', initialFocus, finalFocus, dismissible = true }: {
  open: boolean; onOpenChange: (open: boolean) => void; trigger?: ReactElement
  title: string; description?: string; children?: ReactNode; actions?: ReactNode
  variant?: 'dialog' | 'drawer' | 'stage'; initialFocus?: D.Popup.Props['initialFocus']; finalFocus?: D.Popup.Props['finalFocus']
  dismissible?: boolean
}) {
  const content = <>
    <div className="vx-overlay-head">
      <D.Title className="vx-title">{title}</D.Title>
      <D.Close className="vx-icon-btn" aria-label={`关闭${title}`}><Icon name="close" /></D.Close>
    </div>
    <div className="vx-overlay-body">
      {description && <D.Description className="vx-body">{description}</D.Description>}
      {children}
    </div>
    {actions && <div className="vx-overlay-foot">{actions}</div>}
  </>
  return <D.Root modal open={open} onOpenChange={onOpenChange} disablePointerDismissal={!dismissible}>
    {trigger && <D.Trigger render={trigger} />}
    <D.Portal>
      <D.Backdrop className="vx-scrim" />
      <D.Popup aria-modal="true" className={variant === 'drawer' ? 'vx-drawer' : variant === 'stage' ? 'vx-stage-dialog' : 'vx-dialog'} initialFocus={initialFocus} finalFocus={finalFocus}>
        {variant === 'stage' ? <>
          <div className="vx-stage-content">{children}</div>
          <div className="vx-stage-banner">
            <div className="vx-stage-copy">
              <D.Title className="vx-guide-title">{title}</D.Title>
              {description && <D.Description className="vx-guide-text">{description}</D.Description>}
            </div>
            {actions && <div className="vx-stage-actions">{actions}</div>}
            <D.Close className="vx-icon-btn vx-stage-close" aria-label={`关闭${title}`}><Icon name="close" /></D.Close>
          </div>
        </> : content}
      </D.Popup>
    </D.Portal>
  </D.Root>
}
