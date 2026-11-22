// vincent-ux v1.7.0 · components/react/Dialog.tsx
import { useThemeContainer } from './ThemeScope'
import { Dialog as D } from '@base-ui/react/dialog'
import type { ReactElement, ReactNode } from 'react'
import { Icon } from './Icon'

// 三种外观共用 Base UI 的模态、Esc 与焦点恢复行为。
// modal=false：不加蒙层、不锁定外部，供导览讲解弹窗内的操作时使用（导览说明卡要能点）；Esc 与焦点恢复不变。
export function Dialog({ open, onOpenChange, trigger, title, description, children, actions,
  variant = 'dialog', initialFocus, finalFocus, dismissible = true, modal = true }: {
  open: boolean; onOpenChange: (open: boolean) => void; trigger?: ReactElement
  title: string; description?: string; children?: ReactNode; actions?: ReactNode
  variant?: 'dialog' | 'drawer' | 'stage'; initialFocus?: D.Popup.Props['initialFocus']; finalFocus?: D.Popup.Props['finalFocus']
  dismissible?: boolean
  modal?: boolean
}) {
  const container = useThemeContainer()
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
  return <D.Root modal={modal} open={open} onOpenChange={onOpenChange} disablePointerDismissal={!dismissible}>
    {trigger && <D.Trigger render={trigger} />}
    <D.Portal container={container}>
      {modal && <D.Backdrop className="vx-scrim" />}
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
