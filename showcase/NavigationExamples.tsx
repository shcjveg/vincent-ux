import { useRef, useState } from 'react'
import { Breadcrumbs, Button, Checkbox, EmptyState, Icon, Select, TaskCard, TaskStatus } from '../components/react'

/** History replaces the page title, while the parent workspace and scope remain in place. */
export function BreadcrumbExamples() {
 const [history,setHistory]=useState(true),[scope,setScope]=useState('all'),[hasRecords,setHasRecords]=useState(true),[message,setMessage]=useState('')
 const root=useRef<HTMLDivElement>(null)
 const navigate=(next:boolean)=>{setMessage('');setHistory(next);requestAnimationFrame(()=>root.current?.querySelector<HTMLButtonElement>(next?'.vx-breadcrumbs button':'.vx-pagehead button')?.focus())}
 return <div className="vx-stack" data-testid="breadcrumb-examples">
  <div className="vx-page" ref={root}>
   <div className="vx-pagehead">{history?<Breadcrumbs headingLevel={2} items={[{label:'资料待办',onClick:()=>navigate(false)},{label:'历史已办'}]}/>:<><h2>资料待办</h2><Button variant="ghost" size="sm" onClick={()=>navigate(true)}><Icon name="history"/>历史已办</Button></>}</div>
   {(!history||hasRecords)&&<div className="vx-filterbar"><Select variant="filter" allValue="all" label="资料范围" value={scope} onChange={setScope} options={[{value:'all',label:'全部'},{value:'current',label:'当前项目'}]}/></div>}
   {history&&hasRecords?<TaskCard title="核对本次资料处理范围" status={<TaskStatus type="范围确认" urgency={{label:'普通'}} timestamps={[{label:'于',text:'10/26 10:00',dateTime:'2026-10-26T10:00:00+08:00',suffix:'更新'}]}/>}
    background={<p>保留本次确认时的资料范围、建议与所选动作，供后续回看。</p>} options={[{id:'scope',label:'按当前资料范围继续',recommended:true}]} completedChoice={{id:'scope',text:'按当前资料范围继续'}} completedAction="continue" done onContinue={()=>{}} onTakeover={()=>{}} onDiscuss={()=>setMessage('已定位到这条记录对应的对话示例')}/>:<EmptyState message={history?'还没有处理记录':'当前没有待办事项'}/>}
   {message&&<p className="vx-meta" role="status">{message}</p>}
  </div>
  <details className="sc-test-tools"><summary>体验历史空状态</summary><Checkbox label="显示历史记录" checked={hasRecords} onChange={e=>{setHasRecords(e.target.checked);setMessage('')}}/></details>
 </div>
}
