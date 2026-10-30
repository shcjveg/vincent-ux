// vincent-ux v1.5.0 · components/react/TaskCard.tsx
import { useId, useState, type HTMLAttributes, type ReactNode } from 'react'
import { Attention } from './Attention'
import { Icon } from './Icon'
import { Button } from './Button'

export type TaskCardOption = { id:string;label:string;description?:string;recommended?:boolean }
export type TaskCardChoice = { id:string; text:string }
type TaskCardProps = {
 title:string; status:ReactNode; background:ReactNode; facts?:ReactNode; media?:ReactNode; preview?:ReactNode
 options:TaskCardOption[]; onContinue?:(choice:TaskCardChoice)=>void; onTakeover?:(choice:TaskCardChoice)=>void; onDiscuss?:()=>void
 onDetails?:()=>void; detailsLabel?:string; continueLabel?:string; takeoverLabel?:string; discussLabel?:string
 details?:ReactNode; attention?:boolean; done?:boolean; pending?:'continue'|'takeover'; completedChoice?:TaskCardChoice; completedAction?:'continue'|'takeover'|'external'; completedActionLabel?:string; footer?:ReactNode; error?:string
} & Omit<HTMLAttributes<HTMLElement>,'title'>

export function TaskCard({title,status,background,facts,media,preview,options,onContinue,onTakeover,onDiscuss,onDetails,detailsLabel='查看详情',continueLabel='交给 AI 继续',takeoverLabel='中止，转人工接管',discussLabel='进入对话',details,attention,done,pending,completedChoice,completedAction,completedActionLabel,footer,error,className,...rest}:TaskCardProps){
 const name=useId(),[selected,setSelected]=useState(options.find(o=>o.recommended)?.id??options[0]?.id??'custom'),[custom,setCustom]=useState('')
 const selectedId=done?completedChoice?.id:selected,customText=done?completedChoice?.text??'':custom
 const choice=options.find(o=>o.id===selectedId),isCustom=selectedId==='custom',currentChoice={id:isCustom?'custom':choice?.id??'',text:isCustom?customText:choice?.label??''}
 return <article {...rest} className={['vx-task-card',className].filter(Boolean).join(' ')} data-done={done?true:undefined} aria-busy={!!pending}>
  {attention&&!done&&<Attention corner/>}
  <div className="vx-task-card-main"><header className="vx-task-card-header"><h3 className="vx-task-card-title">{title}</h3>
  <div className="vx-task-card-status">{status}</div></header>
  <div className="vx-task-card-body"><div className="vx-task-card-evidence">
  <div className="vx-task-card-context">
   {media&&<div className="vx-task-card-media">{media}</div>}
   <div className="vx-task-card-background">{background}{preview&&<div className="vx-task-card-preview">{preview}</div>}</div>
  </div>
  {(facts||onDetails)&&<div className="vx-task-card-facts">{facts}{onDetails&&<button type="button" className="vx-section-action" onClick={onDetails}>{detailsLabel}</button>}</div>}
  </div><div className="vx-task-card-decision">
   <fieldset className="vx-task-card-options" disabled={!!done||!!pending}><legend>处理建议</legend>
    {options.map(o=><label key={o.id} className="vx-task-card-option" data-selected={selectedId===o.id||undefined}><input className="vx-radio" type="radio" name={name} value={o.id} checked={selectedId===o.id} onChange={()=>setSelected(o.id)}/><span>{o.label}{o.recommended&&<small>建议</small>}{o.description&&<span className="vx-task-card-option-description">{o.description}</span>}</span></label>)}
    <label className="vx-task-card-option" data-selected={isCustom||undefined}><input className="vx-radio" type="radio" name={name} value="custom" checked={isCustom} onChange={()=>setSelected('custom')}/><span>自定义</span></label>
    {isCustom&&<label className="vx-task-card-custom">处理要求<textarea className="vx-textarea" value={customText} readOnly={!!done} onChange={e=>setCustom(e.target.value)} placeholder="说明希望采用的方案、范围与限制" rows={3}/></label>}
   </fieldset>
  </div></div>
  {details&&<div className="vx-task-card-editor">{details}</div>}
  </div>
   {error&&<p className="vx-task-card-error" data-tone="critical" role="alert">{error}</p>}
   <div className="vx-task-card-actions">
    {onContinue&&<Button className="vx-task-action" data-intent="approve" loading={pending==='continue'} disabled={!!done||!!pending||(isCustom?!custom.trim():!choice)} aria-pressed={done?completedAction==='continue':undefined} onClick={()=>onContinue(currentChoice)}><Icon name="done"/>{continueLabel}</Button>}
    {onTakeover&&<Button className="vx-task-action" data-intent="stop" data-tone="critical" loading={pending==='takeover'} disabled={!!done||!!pending} aria-pressed={done?completedAction==='takeover':undefined} onClick={()=>onTakeover(currentChoice)}><Icon name="blocked"/>{takeoverLabel}</Button>}
    {done&&completedAction==='external'&&<button type="button" className="vx-btn vx-task-action" disabled aria-pressed="true"><Icon name="done"/>{completedActionLabel??'已处理'}</button>}
    {onDiscuss&&<button type="button" className="vx-btn vx-task-action vx-task-action--chat" disabled={!!pending} onClick={onDiscuss}><Icon name="chat"/>{discussLabel}</button>}
   </div>
  {footer&&<div className="vx-task-card-footer">{footer}</div>}
 </article>
}
