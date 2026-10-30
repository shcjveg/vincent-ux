// vincent-ux v1.5.0 · components/react/DateCalendar.tsx
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from './Icon'

import { localDay, parseDay } from './dateMath'
const monthOf=(value:string)=>{const d=parseDay(value);return d.getFullYear()*12+d.getMonth()}
const monthName=(month:number)=>`${Math.floor(month/12)}年${month%12+1}月`
const shiftMonth=(date:Date,delta:number)=>{const n=new Date(date);n.setDate(1);n.setMonth(n.getMonth()+delta);n.setDate(Math.min(date.getDate(),new Date(n.getFullYear(),n.getMonth()+1,0).getDate()));return n}
export function DateCalendar({from,to,today,anchor,onSelect}:{from:string;to:string;today:string;anchor:string;onSelect:(day:string)=>void}){
 const [view,setView]=useState(()=>monthOf(anchor)),[focus,setFocus]=useState(from||today),viewport=useRef<HTMLDivElement>(null),keyboardFocus=useRef<string|null>(null),visibleMonth=useRef(monthOf(anchor))
 useEffect(()=>{visibleMonth.current=view;const root=viewport.current;if(!root)return;const month=root.querySelector<HTMLElement>(`[data-month="${view}"]`);if(month)root.scrollTop=month.offsetTop;if(keyboardFocus.current){root.querySelector<HTMLButtonElement>(`[data-date="${keyboardFocus.current}"]`)?.focus({preventScroll:true});keyboardFocus.current=null}},[view])
 const navigateMonth=(delta:number)=>{const month=visibleMonth.current+delta;visibleMonth.current=month;setView(month);setFocus(localDay(new Date(Math.floor(month/12),month%12,1)))}
 const move=(event:KeyboardEvent<HTMLButtonElement>,value:string)=>{const d=parseDay(value),weekday=(d.getDay()+6)%7;let next:Date
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'||event.key==='ArrowUp'||event.key==='ArrowDown'){next=new Date(d);next.setDate(d.getDate()+({ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[event.key]??0))}
  else if(event.key==='Home'||event.key==='End'){next=new Date(d);next.setDate(d.getDate()+(event.key==='Home'?-weekday:6-weekday))}
  else if(event.key==='PageUp'||event.key==='PageDown')next=shiftMonth(d,(event.key==='PageUp'?-1:1)*(event.shiftKey?12:1))
  else return
  event.preventDefault();const key=localDay(next);setFocus(key);const button=viewport.current?.querySelector<HTMLButtonElement>(`[data-date="${key}"]`);if(button){button.focus();button.scrollIntoView({block:'nearest'})}else{keyboardFocus.current=key;setView(monthOf(key))}
 }
 return <div className="vx-date-calendar">
  <div className="vx-calendar-navigation"><button type="button" className="vx-icon-btn" aria-label="上个月" onClick={()=>navigateMonth(-1)}><Icon name="back" size="sm"/></button><span>月历</span><button type="button" className="vx-icon-btn" aria-label="下个月" onClick={()=>navigateMonth(1)}><Icon name="next" size="sm"/></button></div>
  <div className="vx-calendar-weekdays" aria-hidden="true">{['一','二','三','四','五','六','日'].map(d=><span key={d}>{d}</span>)}</div>
  <div className="vx-calendar-months" ref={viewport} onScroll={e=>{const root=e.currentTarget;const month=[...root.querySelectorAll<HTMLElement>('[data-month]')].find(el=>el.offsetTop+el.offsetHeight>root.scrollTop+12);if(month)visibleMonth.current=Number(month.dataset.month)}}>
   {Array.from({length:13},(_,i)=>view-6+i).map(month=>{const year=Math.floor(month/12),m=month%12,offset=(new Date(year,m,1).getDay()+6)%7,days=new Date(year,m+1,0).getDate(),rows=Math.ceil((offset+days)/7)
    return <section className="vx-calendar-month" data-month={month} key={month}><h3>{monthName(month)}</h3><div role="grid" aria-label={monthName(month)}>{Array.from({length:rows},(_,week)=><div role="row" className="vx-calendar-week" key={week}>{Array.from({length:7},(_,col)=>{const n=week*7+col-offset+1;if(n<1||n>days)return <span role="gridcell" key={col}/>;const value=localDay(new Date(year,m,n)),endpoint=value===from||value===to,within=!!from&&!!to&&value>=from&&value<=to;return <button type="button" role="gridcell" key={col} data-date={value} data-endpoint={endpoint||undefined} data-range={within||undefined} data-start={value===from||undefined} data-end={value===to||undefined} aria-label={`${year}年${m+1}月${n}日`} aria-selected={within||endpoint} aria-current={value===today?'date':undefined} tabIndex={value===focus?0:-1} onFocus={()=>setFocus(value)} onKeyDown={e=>move(e,value)} onClick={()=>{setFocus(value);onSelect(value)}}><span>{n}</span></button>})}</div>)}</div></section>
   })}
  </div>
 </div>
}
