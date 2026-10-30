// vincent-ux v1.5.0 · components/react/Select.tsx
import { Combobox as C } from '@base-ui/react/combobox'
import { useState, type AriaAttributes, type Ref } from 'react'
import { Attention, AttentionMark } from './Attention'
import { Icon } from './Icon'

/** attention：该选项下待处理的数量，选项行尾显示红底计数；零或缺省不显示。 */
export type SelectOption<T extends string> = { value:T;label:string;hint?:string;disabled?:boolean;attention?:number }
export type SelectProps<T extends string> = AriaAttributes & {
 value:T|null;options:SelectOption<T>[];onChange:(value:T)=>void
 label?:string;placeholder?:string;disabled?:boolean;required?:boolean;readOnly?:boolean
 name?:string;id?:string;form?:string;className?:string;ref?:Ref<HTMLButtonElement>;variant?:'field'|'inline'|'filter';allValue?:T
 /** 触发器文字左上角的红点：只表示「这里有待处理」，不计数；数量放在选项上。 */
 attention?:boolean
 /** 允许自定义取值：搜索词没有完全匹配的选项时，列表末尾出现「新增「…」」，选中后 onChange 收到这段文字。 */
 creatable?:boolean
}
export function Select<T extends string>({value,options,onChange,label,placeholder='请选择',disabled,required,readOnly,name,id,form,className,ref,variant='field',allValue,attention=false,creatable=false,...aria}:SelectProps<T>){
 const [query,setQuery]=useState('')
 const [open,setOpen]=useState(false)
 const allOption=allValue===undefined?undefined:options.find(o=>o.value===allValue)
 const base=allOption?[{...allOption,label:'全部'},...options.filter(o=>o.value!==allValue)]:options
 const q=query.trim()
 const createItem=creatable&&q&&!base.some(o=>o.label===q||o.value===q)?{value:q as T,label:`新增「${q}」`,create:true}:null
 // 当前值不在选项里（此前自定义的取值）时，照常显示。
 const current=value&&!base.some(o=>o.value===value)?[{value,label:String(value)}]:[]
 const items:(SelectOption<T>&{create?:boolean})[]=[...base,...current,...(createItem?[createItem]:[])]
 const selected=items.find(o=>o.value===value&&!o.create)??null
 // 搜索词没有匹配到任何已有选项时，回车直接新增（不必先用方向键选中「新增」）。
 const noMatch=!!createItem&&!base.some(o=>`${o.label} ${o.hint??''}`.toLocaleLowerCase().includes(q.toLocaleLowerCase()))
 return <C.Root items={items} value={selected} open={open} onOpenChange={setOpen} onValueChange={o=>{if(o)onChange(o.value)}} isItemEqualToValue={(a,b)=>a.value===b.value}
  disabled={disabled} required={required} readOnly={readOnly} name={name} id={id} form={form}
  onInputValueChange={v=>setQuery(v)}
  filter={(o:SelectOption<T>&{create?:boolean},q)=>!!o.create||`${o.label} ${o.hint??''}`.toLocaleLowerCase().includes(q.toLocaleLowerCase())}>
  <C.Trigger {...aria} ref={ref} id={id} className={['vx-trigger',variant==='inline'&&'vx-trigger--inline',variant==='filter'&&'vx-trigger--filter',className].filter(Boolean).join(' ')} aria-label={label??aria['aria-label']}>
   <AttentionMark on={attention}><span className="vx-trigger-value">{allValue!==undefined&&value===allValue&&label?label:selected?<C.Value/>:<span className="vx-trigger-placeholder">{placeholder}</span>}</span></AttentionMark><Icon name="expand" size="sm"/>
  </C.Trigger>
  <C.Portal><C.Positioner side="bottom" align="start" sideOffset={6} style={{zIndex:'var(--vx-z-popover)'}}>
   <C.Popup className="vx-popup vx-select-popup">
    <div className="vx-select-search"><Icon name="search" size="sm"/><C.Input aria-label={`搜索${label??'选项'}`} placeholder={creatable?'搜索或输入新选项…':'搜索选项…'}
     onKeyDown={e=>{if(e.key==='Enter'&&noMatch&&!e.nativeEvent.isComposing){e.preventDefault();onChange(q as T);setOpen(false)}}}/></div>
    <C.Empty className="vx-select-empty">没有匹配项</C.Empty>
    <C.List className="vx-select-list">{(o:SelectOption<T>&{create?:boolean})=><C.Item key={o.value} value={o} disabled={o.disabled} className={o.create?'vx-option vx-option--create':'vx-option'}><span>{o.label}{o.hint&&<span className="vx-option-hint">{o.hint}</span>}</span>{!!o.attention&&<Attention count={o.attention}/>}</C.Item>}</C.List>
   </C.Popup>
  </C.Positioner></C.Portal>
 </C.Root>
}
