// vincent-ux v1.4.2 · components/react/ActionMenu.tsx
import type { ReactNode } from 'react'
import { Menu } from '@base-ui/react/menu'
import { Icon, type IconName } from './Icon'

export function ActionMenu({ label, children, className, items }: {
  label: string; children: ReactNode; className?: string
  items: { label: string; icon?: IconName; onClick: () => void }[]
}) {
  return <Menu.Root><Menu.Trigger className={className} aria-label={label}>{children}</Menu.Trigger>
    <Menu.Portal><Menu.Positioner side="top" align="start" sideOffset={8} className="vx-menu-positioner">
      <Menu.Popup className="vx-menu" aria-label={label}>
        {items.map(item => <Menu.Item key={item.label} className="vx-menu-item" onClick={item.onClick}>{item.icon && <Icon name={item.icon} />}<span>{item.label}</span></Menu.Item>)}
      </Menu.Popup>
    </Menu.Positioner></Menu.Portal>
  </Menu.Root>
}
