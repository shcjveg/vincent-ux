// vincent-ux v1.4.2 · components/react/SortMenu.tsx
import { Icon } from './Icon'

export function SortMenu({label='更新时间',order,onChange}:{label?:string;order:'asc'|'desc';onChange:(order:'asc'|'desc')=>void}){
 return <button type="button" className="vx-btn vx-btn--ghost vx-btn--sm vx-sort-toggle" data-order={order} aria-label={`${label}：${order==='desc'?'新到旧':'旧到新'}，点击切换为${order==='desc'?'旧到新':'新到旧'}`} onClick={()=>onChange(order==='desc'?'asc':'desc')}><Icon name={order==='desc'?'sort-desc':'sort-asc'}/><span>{label}</span></button>
}
