import { useRef, useState } from 'react'
import { ActionMenu, DateFilter, Button, EmptyState, Field, Icon, SearchField, SectionCard, TableScroll, Tabs, WorkspaceOverlay, useViewportQuery } from '../components/react'

import type { DateFilterValue } from '../components/react/DateFilter'

type SessionState = { id:string; title:string; active:string; renderOpen:boolean; chatOpen:boolean; draft:string; messages:string[] }
const seed = (id:string,title:string):SessionState => ({id,title,active:'draft',renderOpen:true,chatOpen:false,draft:'',messages:[]})

// Reference host: session state is separate from each mounted page's own unsaved state.
export function WorkspaceDemo(){
 const [sessions,setSessions]=useState([seed('plan','方案讨论'),seed('sources','资料核对')]),[active,setActive]=useState('plan')
 const [desktopNav,setDesktopNav]=useState(true),[mobileNav,setMobileNav]=useState(false)
 const compactNav=useViewportQuery('(max-width:740px)'),compactChat=useViewportQuery('(max-width:980px)')
 const navOpen=compactNav?mobileNav:desktopNav,current=sessions.find(s=>s.id===active)!
 const navTrigger=useRef<HTMLButtonElement>(null),navClose=useRef<HTMLButtonElement>(null),input=useRef<HTMLTextAreaElement>(null)
 const root=useRef<HTMLDivElement>(null)
 const update=(id:string,patch:Partial<SessionState>)=>setSessions(prev=>prev.map(s=>s.id===id?{...s,...patch}:s))
 const reveal=()=>{update(active,{renderOpen:true,...(compactChat?{chatOpen:false}:{})});requestAnimationFrame(()=>root.current?.querySelector<HTMLButtonElement>('.vx-tabset:not([hidden]) [role=tab][aria-selected=true]')?.focus())}
 const closeRender=()=>{update(active,{renderOpen:false,chatOpen:true});requestAnimationFrame(()=>input.current?.focus())}
 const closeChat=()=>{update(active,{chatOpen:false,renderOpen:true});requestAnimationFrame(()=>root.current?.querySelector<HTMLButtonElement>('.vx-tabset:not([hidden]) [role=tab][aria-selected=true]')?.focus())}
 const send=()=>{if(!current.draft.trim())return;update(active,{messages:[...current.messages,current.draft.trim()],draft:''})}
 const navButton=<button type="button" ref={navTrigger} className="vx-icon-btn" aria-label="展开示例导航" aria-expanded={navOpen} onClick={()=>setMobileNav(true)}><Icon name="expand-sidebar"/></button>
 return <div ref={root} className="vx-app sc-session-workspace" data-testid="session-workspace" data-nav={navOpen?undefined:'collapsed'} data-render={current.renderOpen?undefined:'closed'}>
  <WorkspaceOverlay active={compactNav} open={mobileNav} onOpenChange={setMobileNav} label="示例导航" variant="nav" initialFocus={navClose} finalFocus={navTrigger}>
   <aside className="vx-nav" aria-label="示例会话导航">
    <div className="vx-nav-brand"><Icon name="apps"/><span className="vx-nav-brand-text">工作区</span><button type="button" ref={navClose} className="vx-icon-btn" aria-label={navOpen?'收起示例导航':'展开示例导航'} aria-expanded={navOpen} onClick={()=>compactNav?setMobileNav(false):setDesktopNav(!desktopNav)}><Icon name={navOpen?'collapse-sidebar':'expand-sidebar'}/></button></div>
    <div className="vx-nav-scroll">
     <div className="vx-nav-group" data-nav-section="apps"><div className="vx-nav-group-title">常用页面</div><button className="vx-nav-item" title="引用资料" onClick={()=>{update(active,{active:'references',renderOpen:true,...(compactChat?{chatOpen:false}:{})});setMobileNav(false)}}><Icon name="report"/><span className="vx-nav-item-label">引用资料</span></button></div>
     <div className="vx-nav-group" data-nav-section="sessions"><div className="vx-nav-group-title">会话</div>{sessions.map(s=><button key={s.id} className="vx-nav-item" title={s.title} aria-current={s.id===active?'true':undefined} onClick={()=>{setActive(s.id);setMobileNav(false)}}><Icon name="chat"/><span className="vx-nav-item-label">{s.title}</span></button>)}</div>
    </div>
    <ActionMenu className="vx-nav-account" label="示例用户菜单" items={[{label:'展开示例导航',onClick:()=>setDesktopNav(true)}]}><span className="vx-avatar">林</span><span className="vx-nav-account-text">林同学</span><Icon name="more" className="vx-nav-account-more"/></ActionMenu>
   </aside>
  </WorkspaceOverlay>
  {current.chatOpen&&<WorkspaceOverlay active={compactChat&&current.renderOpen} open onOpenChange={open=>{if(!open)closeChat()}} label="示例对话" initialFocus={input} finalFocus={false}>
   <section className="vx-chat" aria-label="示例对话" onKeyDown={e=>{if(e.key==='Escape'&&!e.defaultPrevented&&!mobileNav&&!e.nativeEvent.isComposing){e.preventDefault();closeChat()}}}>
    <header className="vx-chat-head">{compactNav&&!current.renderOpen?navButton:<Icon name="chat"/>}<span className="vx-chat-title">{current.title}</span>{!current.renderOpen&&<button className="vx-icon-btn" aria-label="恢复示例页面" onClick={reveal}><Icon name="open-workspace"/></button>}<button className="vx-icon-btn" aria-label="收起示例对话" onClick={closeChat}><Icon name="collapse-sidebar"/></button></header>
    <div className="vx-chat-body"><p className="vx-body">讨论当前资料，并保留页面中的工作进度。</p>{current.messages.map((message,i)=><p className="vx-msg vx-msg--user" key={i}>{message}</p>)}</div>
    <div className="vx-composer"><textarea ref={input} aria-label="示例对话输入" value={current.draft} onChange={e=>update(active,{draft:e.target.value})} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();send()}}}/><div className="vx-composer-bar"><span className="vx-spacer"/><button className="vx-composer-send" aria-label="发送示例消息" disabled={!current.draft.trim()} onClick={send}><Icon name="send"/></button></div></div>
   </section>
  </WorkspaceOverlay>}
  <section className="vx-render" aria-label="示例页面">
   {[...sessions].sort((a,b)=>Number(b.id===active)-Number(a.id===active)).map(session=><Tabs key={session.id} keepMounted hidden={session.id!==active||!session.renderOpen} label="会话页面" variant="workspace" value={session.active} onChange={value=>update(session.id,{active:value})}
    leading={compactNav&&session.id===active&&current.renderOpen?navButton:undefined}
    actions={<button className="vx-icon-btn vx-workspace-close" aria-label="关闭示例页面" onClick={closeRender}><Icon name="close"/></button>}
    items={[{value:'draft',label:'方案草稿',content:<DraftPage onDiscuss={()=>update(session.id,{chatOpen:true})}/>},{value:'references',label:'引用资料',content:<ReferencesPage/>}]}/>) }
  </section>
 </div>
}
function DraftPage({onDiscuss}:{onDiscuss:()=>void}){
 const [note,setNote]=useState('')
 return <div className="vx-render-body"><div className="vx-page"><Field label="工作备注" hint="切换会话、页签或关闭页面后仍保留本次输入。">{props=><textarea {...props} className="vx-textarea" rows={4} value={note} onChange={e=>setNote(e.target.value)}/>}</Field><Button variant="ghost" onClick={onDiscuss}><Icon name="chat"/>讨论这份草稿</Button></div></div>
}
function ReferencesPage(){
 const [query,setQuery]=useState('')
 const records=Array.from({length:18},(_,i)=>`参考资料 ${String(i+1).padStart(2,'0')}`).filter(name=>name.includes(query))
 return <div className="vx-render-body"><div className="vx-page"><SearchField label="筛选示例资料" value={query} onChange={setQuery}/><SectionCard title="资料清单" updatedAt={{text:'2026-10-25 10:00',dateTime:'2026-10-25T10:00:00+08:00',detail:'示例来源快照 · 北京时间'}}>{records.length?<ul className="vx-rows">{records.map(name=><li className="vx-row" key={name}>{name}</li>)}</ul>:<EmptyState message="没有符合条件的资料" action={<Button variant="ghost" onClick={()=>setQuery('')}>清除搜索</Button>}/>}</SectionCard></div></div>
}

export function ComponentStatesDemo(){
 const [opened,setOpened]=useState(''),[period,setPeriod]=useState<DateFilterValue>({from:'',to:''})
 return <div className="vx-stack" data-testid="component-states">
  <SectionCard title="来源记录" controls={<span className="vx-meta">近 7 天</span>} updatedAt={{text:'2026-10-25 10:00',dateTime:'2026-10-25T10:00:00+08:00',detail:'示例来源快照 · 北京时间'}}><EmptyState message="暂无来源记录"/></SectionCard>
  <SectionCard title="处理记录"><EmptyState message="暂无处理记录"/></SectionCard>
  <SectionCard title="表格操作"><TableScroll label="记录操作示例" minWidth={480}><table className="vx-table"><thead><tr><th>记录</th><th>操作</th></tr></thead><tbody><tr><td>需要核对的关联资料</td><td><Button onClick={()=>setOpened('已打开关联记录')}>打开关联记录</Button></td></tr></tbody></table></TableScroll>{opened&&<p role="status">{opened}</p>}</SectionCard>
  <SectionCard title="比较报告期间" data-testid="date-comparison-demo"><DateFilter allowComparison value={period} field="period" fields={[{id:'period',label:'统计期间'}]} onChange={setPeriod}/></SectionCard>
  <div className="sc-long-action"><Button onClick={()=>setOpened('已查看下一步所需资料')}>查看这项工作下一步需要准备的完整资料</Button></div>
 </div>
}
