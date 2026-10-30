// vincent-ux v1.5.0 · components/react/UserMenu.tsx
// 右上角的当前用户入口：只放一个头像，点开是极简菜单——名字与身份一行说明，下面是账户动作。
// 外壳已有用户卡片的产品（例如侧栏底部）不再重复放；嵌入宿主的应用页只在宿主不显示身份时使用。
import { Menu } from '@base-ui/react/menu'
import { Icon, type IconName } from './Icon'

export function UserMenu({ name, meta, items = [] }: {
  name: string
  /** 身份说明：角色、账号或所属组织，一行。 */
  meta?: string
  /** 账户动作；没有可做的动作时可省略，菜单只展示身份。 */
  items?: { label: string; icon?: IconName; onClick: () => void }[]
}) {
  const initial = Array.from(name.trim())[0] ?? '?'
  return <Menu.Root>
    <Menu.Trigger className="vx-user-trigger" aria-label={`当前用户：${name}`}><span className="vx-avatar" aria-hidden="true">{initial}</span></Menu.Trigger>
    <Menu.Portal><Menu.Positioner side="bottom" align="end" sideOffset={8} className="vx-menu-positioner">
      <Menu.Popup className="vx-menu" aria-label="当前用户">
        <div className="vx-menu-head">
          <span className="vx-avatar" aria-hidden="true">{initial}</span>
          <span className="vx-menu-head-text"><span className="vx-menu-head-name">{name}</span>{meta && <span className="vx-menu-head-meta">{meta}</span>}</span>
        </div>
        {items.map(item => <Menu.Item key={item.label} className="vx-menu-item" onClick={item.onClick}>{item.icon && <Icon name={item.icon} />}<span>{item.label}</span></Menu.Item>)}
      </Menu.Popup>
    </Menu.Positioner></Menu.Portal>
  </Menu.Root>
}
