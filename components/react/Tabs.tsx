// vincent-ux v1.4.2 · components/react/Tabs.tsx
import { Tabs as T } from '@base-ui/react/tabs'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon'

export type TabItem<V extends string> = { value: V; label: string; content: ReactNode; closable?: boolean; disabled?: boolean; indicator?: ReactNode }
type ClosePosition = { left: number; top: number; visible: boolean }
export function Tabs<V extends string>({ label, value, items, onChange, onClose, actions, leading, variant = 'content', keepMounted = false, hidden = false }: {
  label: string; value: V; items: TabItem<V>[]; onChange: (value: V) => void; onClose?: (value: V) => void
  actions?: ReactNode; leading?: ReactNode; variant?: 'content' | 'workspace'; keepMounted?: boolean; hidden?: boolean
}) {
  const buttons = useRef(new Map<V, HTMLElement>())
  const viewport = useRef<HTMLDivElement>(null), list = useRef<HTMLDivElement>(null)
  const [positions,setPositions] = useState<Record<string,ClosePosition>>({})
  const [hovered,setHovered] = useState<string|null>(null), [focused,setFocused] = useState<string|null>(null)
  // Close controls occupy the tab's reserved space but remain outside the ARIA tablist.
  useLayoutEffect(()=>{
    const root=viewport.current,scroller=list.current
    if(!root||!scroller)return
    const measure=()=>{
      const box=root.getBoundingClientRect(),next:Record<string,ClosePosition>={}
      for(const item of items){const target=buttons.current.get(item.value);if(!target||!item.closable)continue;const rect=target.getBoundingClientRect(),style=getComputedStyle(target),size=parseFloat(style.getPropertyValue('--vx-tab-close-size'))||24,inset=parseFloat(style.getPropertyValue('--vx-tab-close-inset'))||2,left=rect.right-box.left-size-inset;next[item.value]={left,top:rect.top-box.top+(rect.height-size)/2,visible:left>=0&&left+size<=box.width}}
      setPositions(prev=>JSON.stringify(prev)===JSON.stringify(next)?prev:next)
    }
    measure()
    const observer=new ResizeObserver(measure)
    observer.observe(root)
    for(const target of buttons.current.values())observer.observe(target)
    scroller.addEventListener('scroll',measure,{passive:true})
    return ()=>{observer.disconnect();scroller.removeEventListener('scroll',measure)}
  },[items])
  // Reveal the active tab within this strip only; never scroll the document.
  useLayoutEffect(() => {
    const root = viewport.current, scroller = list.current
    if (!root || !scroller) return
    const reveal = () => {
      const target = buttons.current.get(value)
      if (!target) return
      const box = scroller.getBoundingClientRect(), rect = target.getBoundingClientRect(), style = getComputedStyle(scroller)
      const left = box.left + parseFloat(style.paddingLeft), right = box.right - parseFloat(style.paddingRight)
      if (rect.width > right - left || rect.right > right) scroller.scrollLeft += rect.right - right
      else if (rect.left < left) scroller.scrollLeft += rect.left - left
    }
    reveal()
    const observer = new ResizeObserver(reveal)
    observer.observe(root)
    return () => observer.disconnect()
  }, [value, items.length])
  const close = (item: TabItem<V>) => {
    if (!onClose || !item.closable) return
    const index = items.indexOf(item)
    const next = items.slice(index + 1).find(i => !i.disabled) ?? items.slice(0, index).reverse().find(i => !i.disabled)
    if (value === item.value && next) onChange(next.value)
    onClose(item.value)
    const focus = value === item.value ? next?.value : value
    if (focus) requestAnimationFrame(() => buttons.current.get(focus)?.focus())
  }
  return <T.Root hidden={hidden} className={`vx-tabset vx-tabset--${variant}`} value={value} onValueChange={v => { const item = items.find(i => i.value === v); if (item) onChange(item.value) }}>
    <div className="vx-tabs-bar">
      {leading && <div className="vx-tabs-leading">{leading}</div>}
      <div className="vx-tabs-viewport" ref={viewport}
        onPointerMove={e=>setHovered((e.target as HTMLElement).closest<HTMLElement>('[data-tab-key]')?.dataset.tabKey??null)} onPointerLeave={()=>setHovered(null)}
        onFocusCapture={e=>setFocused((e.target as HTMLElement).closest<HTMLElement>('[data-tab-key]')?.dataset.tabKey??null)}
        onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setFocused(null)}}>
        <T.List ref={list} activateOnFocus className={`vx-tabs${variant==='content'?' vx-seg':''}`} aria-label={label}>
          {items.map(item => <div key={item.value} className="vx-tab-item" data-tab-key={item.value} data-active={item.value===value} data-hovered={item.value===hovered} data-focused={item.value===focused} data-closable={!!item.closable&&!!onClose} role="presentation">
            <T.Tab value={item.value} disabled={item.disabled} className="vx-tab vx-tab-label"
              ref={el=>{if(el)buttons.current.set(item.value,el);else buttons.current.delete(item.value)}}
              onKeyDown={e=>{if(e.key==='Delete'&&item.closable&&onClose){e.preventDefault();close(item)}}}>
              <span className="vx-tab-caption"><span className="vx-tab-text">{item.label}</span>{item.indicator&&<span className="vx-tab-indicator">{item.indicator}</span>}</span>
            </T.Tab>
          </div>)}
        </T.List>
        <div className="vx-tabs-close-layer">
          {items.filter(item=>item.closable&&onClose&&positions[item.value]?.visible).map(item=><button key={item.value} type="button" className="vx-tab-close" disabled={item.disabled}
            data-tab-key={item.value} data-revealed={hovered===item.value||focused===item.value} style={{left:positions[item.value].left,top:positions[item.value].top}}
            tabIndex={item.value===value?0:-1} aria-label={`关闭${item.label}`} onClick={()=>close(item)}><Icon name="close" size="sm"/></button>)}
        </div>
      </div>
      {actions && <div className="vx-tabs-actions">{actions}</div>}
    </div>
    {(keepMounted ? [...items].sort((a,b)=>Number(b.value===value)-Number(a.value===value)) : items).map(item=><T.Panel key={item.value} value={item.value} keepMounted={keepMounted} className="vx-tab-panel">{item.content}</T.Panel>)}
  </T.Root>
}
