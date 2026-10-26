// vincent-ux v1.4.3 · components/react/Breadcrumbs.tsx
import type { HTMLAttributes } from 'react'

export type BreadcrumbItem = { label:string; href?:string; onClick?:()=>void }
export function Breadcrumbs({items,label='页面路径',headingLevel,className,...rest}:{items:BreadcrumbItem[];label?:string;headingLevel?:1|2|3} & HTMLAttributes<HTMLElement>){
 const Current=headingLevel?`h${headingLevel}` as 'h1'|'h2'|'h3':'span'
 return <nav {...rest} aria-label={label} className={['vx-breadcrumbs',headingLevel&&'vx-breadcrumbs--title',className].filter(Boolean).join(' ')}><ol>
  {items.map((item,index)=><li key={`${index}:${item.label}`}>
   {index>0&&<span className="vx-breadcrumb-separator" aria-hidden="true">/</span>}
   {index===items.length-1?<Current aria-current="page">{item.label}</Current>:item.href?<a href={item.href} onClick={item.onClick}>{item.label}</a>:item.onClick?<button type="button" onClick={item.onClick}>{item.label}</button>:<span>{item.label}</span>}
  </li>)}
 </ol></nav>
}
