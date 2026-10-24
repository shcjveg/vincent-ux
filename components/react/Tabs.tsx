// vincent-ux v1.3.0 · components/react/Tabs.tsx
import { Tabs as T } from '@base-ui/react/tabs'
import { useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

export type TabItem<V extends string> = { value: V; label: string; content: ReactNode; closable?: boolean; disabled?: boolean; indicator?: ReactNode }
export function Tabs<V extends string>({ label, value, items, onChange, onClose, actions, variant = 'content' }: {
  label: string; value: V; items: TabItem<V>[]; onChange: (value: V) => void; onClose?: (value: V) => void
  actions?: ReactNode; variant?: 'content' | 'workspace'
}) {
  const buttons = useRef(new Map<V, HTMLElement>())
  const close = (item: TabItem<V>) => {
    if (!onClose || !item.closable) return
    const index = items.indexOf(item)
    const next = items.slice(index + 1).find(i => !i.disabled) ?? items.slice(0, index).reverse().find(i => !i.disabled)
    if (value === item.value && next) onChange(next.value)
    onClose(item.value)
    const focus = value === item.value ? next?.value : value
    if (focus) requestAnimationFrame(() => buttons.current.get(focus)?.focus())
  }
  return <T.Root className={`vx-tabset vx-tabset--${variant}`} value={value} onValueChange={v => { const item = items.find(i => i.value === v); if (item) onChange(item.value) }}>
    <div className="vx-tabs-bar">
      <T.List activateOnFocus className="vx-tabs" aria-label={label}>
        {items.map(item => <T.Tab key={item.value} value={item.value} disabled={item.disabled} className="vx-tab vx-tab-label"
          ref={el => { if (el) buttons.current.set(item.value, el); else buttons.current.delete(item.value) }}
          onKeyDown={e => { if (e.key === 'Delete' && item.closable && onClose) { e.preventDefault(); close(item) } }}>
          {item.label}{item.indicator}
        </T.Tab>)}
      </T.List>
      {items.filter(item => item.value === value && item.closable && onClose).map(item =>
        <button key={item.value} type="button" className="vx-tab-close" disabled={item.disabled}
          aria-label={`关闭${item.label}`} onClick={() => close(item)}><Icon name="close" size="sm" /></button>)}
      {actions && <div className="vx-tabs-actions">{actions}</div>}
    </div>
    {items.map(item => <T.Panel key={item.value} value={item.value} className="vx-tab-panel">{item.content}</T.Panel>)}
  </T.Root>
}
