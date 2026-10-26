// vincent-ux v1.4.2 · components/react/Select.tsx
import { Combobox as C } from '@base-ui/react/combobox'
import type { AriaAttributes, Ref } from 'react'
import { Icon } from './Icon'

export type SelectOption<T extends string> = { value:T;label:string;hint?:string;disabled?:boolean }
export type SelectProps<T extends string> = AriaAttributes & {
 value:T|null;options:SelectOption<T>[];onChange:(value:T)=>void
 label?:string;placeholder?:string;disabled?:boolean;required?:boolean;readOnly?:boolean
 name?:string;id?:string;form?:string;className?:string;ref?:Ref<HTMLButtonElement>;variant?:'field'|'inline'|'filter';allValue?:T
}
export function Select<T extends string>({value,options,onChange,label,placeholder='请选择',disabled,required,readOnly,name,id,form,className,ref,variant='field',allValue,...aria}:SelectProps<T>){
 const allOption=allValue===undefined?undefined:options.find(o=>o.value===allValue)
 const items=allOption?[{...allOption,label:'全部'},...options.filter(o=>o.value!==allValue)]:options
 const selected=items.find(o=>o.value===value)??null
 return <C.Root items={items} value={selected} onValueChange={o=>{if(o)onChange(o.value)}} isItemEqualToValue={(a,b)=>a.value===b.value}
  disabled={disabled} required={required} readOnly={readOnly} name={name} id={id} form={form}
  filter={(o,q)=>`${o.label} ${o.hint??''}`.toLocaleLowerCase().includes(q.toLocaleLowerCase())}>
  <C.Trigger {...aria} ref={ref} id={id} className={['vx-trigger',variant==='inline'&&'vx-trigger--inline',variant==='filter'&&'vx-trigger--filter',className].filter(Boolean).join(' ')} aria-label={label??aria['aria-label']}>
   <span className="vx-trigger-value">{allValue!==undefined&&value===allValue&&label?label:<C.Value placeholder={placeholder}/>}</span><Icon name="expand" size="sm"/>
  </C.Trigger>
  <C.Portal><C.Positioner side="bottom" align="start" sideOffset={6} style={{zIndex:'var(--vx-z-popover)'}}>
   <C.Popup className="vx-popup vx-select-popup">
    <div className="vx-select-search"><Icon name="search" size="sm"/><C.Input aria-label={`搜索${label??'选项'}`} placeholder="搜索选项…"/></div>
    <C.Empty className="vx-select-empty">没有匹配项</C.Empty>
    <C.List className="vx-select-list">{(o:SelectOption<T>)=><C.Item key={o.value} value={o} disabled={o.disabled} className="vx-option"><span>{o.label}{o.hint&&<span className="vx-option-hint">{o.hint}</span>}</span></C.Item>}</C.List>
   </C.Popup>
  </C.Positioner></C.Portal>
 </C.Root>
}
