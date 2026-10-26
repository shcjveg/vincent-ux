// vincent-ux v1.4.0 · components/react/DateFilter.tsx
import { useState } from 'react'
import { Popover } from '@base-ui/react/popover'
import { Icon } from './Icon'
import { Select } from './Select'
import { Switch } from './Switch'
import { DateCalendar } from './DateCalendar'
import { localDay, parseDay } from './dateMath'

export type DateFilterValue={from:string;to:string;preset?:string;comparison?:{from:string;to:string}}
const PRESETS=['今天','昨天','本周','上周','最近 7 天','最近 14 天','最近 28 天','最近 30 天','本月','上月','最近 90 天','季度初至今','最近 12 个月']
function presetRange(label:string,today:string){const end=parseDay(today),start=new Date(end)
 if(label==='昨天'){end.setDate(end.getDate()-1);start.setDate(start.getDate()-1)}
 else if(label==='本周')start.setDate(start.getDate()-(start.getDay()+6)%7)
 else if(label==='上周'){end.setDate(end.getDate()-(end.getDay()+6)%7-1);start.setTime(end.getTime());start.setDate(start.getDate()-6)}
 else if(label==='本月')start.setDate(1)
 else if(label==='上月'){end.setDate(0);start.setFullYear(end.getFullYear(),end.getMonth(),1)}
 else if(label==='季度初至今')start.setMonth(Math.floor(start.getMonth()/3)*3,1)
 else if(label==='最近 12 个月'){const y=start.getFullYear()-1,m=start.getMonth(),d=Math.min(start.getDate(),new Date(y,m+1,0).getDate());start.setFullYear(y,m,d);start.setDate(start.getDate()+1)}
 else if(label.startsWith('最近'))start.setDate(start.getDate()-Number(label.match(/\d+/)?.[0])+1)
 return{from:localDay(start),to:localDay(end),preset:label}
}
function precedingRange(from:string,to:string){const a=parseDay(from),b=parseDay(to),days=Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000)+1,end=new Date(a),start=new Date(a);end.setDate(end.getDate()-1);start.setDate(start.getDate()-days);return{from:localDay(start),to:localDay(end)}}
export function DateFilter({value,field,fields,onChange,allowComparison=false}:{value:DateFilterValue;field:string;fields:{id:string;label:string}[];onChange:(value:DateFilterValue,field:string)=>void;allowComparison?:boolean}){
 const [open,setOpen]=useState(false),[draft,setDraft]=useState(value),[draftField,setDraftField]=useState(field),[active,setActive]=useState<'from'|'to'>('from'),[single,setSingle]=useState(false),[today,setToday]=useState(()=>localDay(new Date())),[anchor,setAnchor]=useState(()=>value.from||localDay(new Date())),[compare,setCompare]=useState(!!value.comparison)
 const fieldLabel=fields.find(f=>f.id===field)?.label??'时间'
 const label=value.from||value.to?`${fieldLabel} · ${value.preset||(value.from===value.to?value.from:`${value.from||'不限'}—${value.to||'不限'}`)}`:'时间范围'
 const invalid=!draft.from||!draft.to||draft.from>draft.to
 const selectDate=(day:string)=>{if(single){setDraft({from:day,to:day});return}if(active==='from'){setDraft({from:day,to:''});setActive('to')}else{setDraft({from:draft.from&&draft.from<day?draft.from:day,to:draft.from&&draft.from>day?draft.from:day});setActive('from')}}
 const editDate=(key:'from'|'to',v:string)=>{setDraft(d=>({...d,[key]:v,...(single?{from:v,to:v}:{}),preset:undefined}));if(/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(parseDay(v).valueOf()))setAnchor(v)}
 const apply=()=>{onChange({...draft,comparison:allowComparison&&compare?precedingRange(draft.from,draft.to):undefined},draftField);setOpen(false)}
 return <Popover.Root open={open} onOpenChange={v=>{setOpen(v);if(v){const now=localDay(new Date());setToday(now);setDraft(value);setDraftField(field);setAnchor(value.from||now);setActive('from');setSingle(!!value.from&&value.from===value.to&&!value.preset);setCompare(!!value.comparison)}}}>
  <Popover.Trigger className="vx-btn vx-btn--ghost vx-btn--sm vx-date-trigger" aria-label={label==='时间范围'?label:`时间范围：${label}`} data-active={!!(value.from||value.to)||undefined}><Icon name="calendar"/><span>{label}</span></Popover.Trigger>
  <Popover.Portal><Popover.Positioner side="bottom" align="end" sideOffset={6} className="vx-control-positioner"><Popover.Popup className="vx-popup vx-date-popup" aria-label="时间范围设置">
   <div className="vx-date-heading"><Popover.Title>时间范围</Popover.Title><Select label="筛选时间字段" value={draftField} options={fields.map(f=>({value:f.id,label:f.label}))} onChange={setDraftField} variant="inline"/></div>
   <div className="vx-date-body">
    <aside className="vx-date-sidebar"><div className="vx-date-presets" role="group" aria-label="快捷日期范围">
     <button type="button" className="vx-date-preset" aria-pressed={!draft.preset&&!single} onClick={()=>{setSingle(false);setDraft(d=>({...d,preset:undefined}));setActive('from')}}>自定义</button>
     <button type="button" className="vx-date-preset" aria-pressed={single} onClick={()=>{setSingle(true);const d=draft.from||today;setDraft({from:d,to:d});setAnchor(d);setActive('from')}}>具体日期</button>
     <div className="vx-control-divider"/>
     {PRESETS.map(p=><button type="button" className="vx-date-preset" key={p} aria-pressed={draft.preset===p} onClick={()=>{const range=presetRange(p,today);setDraft(range);setSingle(false);setAnchor(range.from);setActive('from')}}>{p}{p==='本周'&&<small>周一至今天</small>}{p==='上周'&&<small>周一至周日</small>}</button>)}
    </div>{allowComparison&&<div className="vx-date-comparison"><Switch label="对比上一时段" checked={compare} onChange={e=>setCompare(e.target.checked)}/></div>}</aside>
    <div className="vx-date-main">
     <div className="vx-date-inputs"><label data-active={active==='from'||undefined}>{single?'日期':'开始日期'}<input className="vx-input" type="date" aria-label={single?'具体日期':'起始日期'} value={draft.from} onFocus={()=>setActive('from')} onChange={e=>editDate('from',e.target.value)}/></label>{!single&&<><span className="vx-date-dash">—</span><label data-active={active==='to'||undefined}>结束日期<input className="vx-input" type="date" aria-label="截止日期" value={draft.to} onFocus={()=>setActive('to')} onChange={e=>editDate('to',e.target.value)}/></label></>}</div>
     <DateCalendar key={anchor} from={draft.from} to={draft.to} today={today} anchor={anchor} onSelect={selectDate}/>
     {draft.from&&draft.to&&draft.from>draft.to&&<p className="vx-date-error" role="alert">结束日期不能早于开始日期</p>}
     {allowComparison&&compare&&!invalid&&<p className="vx-date-compare-range">对比：{precedingRange(draft.from,draft.to).from} — {precedingRange(draft.from,draft.to).to}</p>}
    </div>
   </div>
   <div className="vx-date-actions"><button type="button" className="vx-btn vx-btn--ghost vx-btn--sm" onClick={()=>{onChange({from:'',to:''},draftField);setOpen(false)}}>清除日期</button><div><Popover.Close className="vx-btn vx-btn--ghost vx-btn--sm">取消</Popover.Close><button type="button" className="vx-btn vx-btn--primary vx-btn--sm" disabled={invalid} onClick={apply}>应用</button></div></div>
  </Popover.Popup></Popover.Positioner></Popover.Portal>
 </Popover.Root>
}
