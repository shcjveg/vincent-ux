import { useId, useRef, useState } from 'react'
import { AttentionTitle, Button, EmptyState, Field, Fold, Icon, Metric, SectionCard, Select, Switch, TableScroll } from '../components/react'

// These compositions use the same component contracts as the consuming prototype.
export function DisclosureExamples() {
 const [groupOpen,setGroupOpen]=useState(false),[enabled,setEnabled]=useState(true)
 const [editorOpen,setEditorOpen]=useState(false),[saved,setSaved]=useState(''),[draft,setDraft]=useState('')
 const [inlineOpen,setInlineOpen]=useState(false),[stepsOpen,setStepsOpen]=useState(false),[running,setRunning]=useState(false)
 const inlineId=useId(),stepsId=useId()
 let validLink=false
 try{const url=new URL(draft);validLink=url.protocol==='https:'&&!url.username&&!url.password}catch{}
 const editor=useRef<HTMLDivElement>(null)
 const stepsExpanded=running||stepsOpen
 return <div className="vx-stack vx-stack--lg" data-testid="disclosure-examples">
  <SectionCard title="分组收纳" data-testid="group-disclosure">
   <Fold summary="内容检查" description={groupOpen?undefined:'核对资料来源；检查发布范围'} count="2 条" open={groupOpen} onOpenChange={setGroupOpen}>
    <div className="vx-rows"><div className="vx-row"><span className="vx-row-main"><span className="vx-row-title">核对资料来源</span><span className="vx-row-meta">内容进入发布准备前检查</span></span><Switch label="来源检查" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/></div><div className="vx-row"><span className="vx-row-main"><span className="vx-row-title">检查发布范围</span><span className="vx-row-meta">仅覆盖当前选定渠道</span></span><span className="vx-meta">已启用</span></div></div>
   </Fold>
  </SectionCard>
  <SectionCard title="对象详情与编辑" data-testid="detail-disclosure">
   <Fold variant="row" summary="参考资料" description="渠道资料 · 2 份待核对" count="2 份"><p className="vx-body">对象名称与必要说明在展开后继续保留，补充内容直接排在原承载面。</p></Fold>
   <div ref={editor}><Fold summary={saved?'编辑来源链接':'补充来源链接'} open={editorOpen} onOpenChange={next=>{setDraft(saved);setEditorOpen(next)}}>
    <div className="vx-stack"><Field label="来源链接" error={draft.trim()&&!validLink?'请输入不含登录信息的完整 HTTPS 链接。':undefined} hint="示例仅保存本页状态。关闭编辑区会放弃尚未保存的修改。">{props=><input {...props} type="url" className="vx-input" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="https://example.com/reference"/>}</Field><div><Button disabled={!validLink||draft===saved} onClick={()=>{setSaved(draft.trim());setEditorOpen(false);requestAnimationFrame(()=>editor.current?.querySelector<HTMLButtonElement>('.vx-fold-head')?.focus())}}>保存链接</Button></div></div>
   </Fold></div>
   {saved&&<p className="vx-meta" role="status">已保存：{saved}</p>}
  </SectionCard>
  <SectionCard title="分组入口与历史" data-testid="history-disclosure">
   <Fold summary={<AttentionTitle count={2}>待核对资料</AttentionTitle>} defaultOpen className="vx-todo-group"><ul className="vx-list"><li>来源记录</li><li>范围说明</li></ul></Fold>
   <Fold summary="处理记录" count="2 项"><ul className="vx-list"><li>范围已核对</li><li>来源已补齐</li></ul></Fold>
  </SectionCard>
  <SectionCard title="行内补充步骤" data-testid="inline-disclosure">
   <div className="vx-cluster"><span className="vx-body">数据来源尚未连接</span><Button size="sm" aria-expanded={inlineOpen} aria-controls={inlineId} onClick={()=>setInlineOpen(v=>!v)}>查看连接步骤<Icon name="expand" size="sm" className="vx-chev"/></Button></div>
   <div id={inlineId} hidden={!inlineOpen}><ol className="vx-list"><li>打开来源设置。</li><li>核对授权范围后连接。</li></ol></div>
  </SectionCard>
  <SectionCard title="对话中的执行过程" data-testid="steps-disclosure">
   <div className="vx-msg-block"><button type="button" className="vx-steps-toggle" aria-expanded={stepsExpanded} aria-controls={stepsId} onClick={()=>setStepsOpen(v=>!v)}><span className="vx-msg-block-title">整理参考资料</span><span className="vx-count">{running?'1/2':'2/2'}</span><span className="vx-spacer"/><Icon name="expand" size="sm"/></button><div id={stepsId} className="vx-steps" hidden={!stepsExpanded}><div className="vx-step" data-state="done"><span className="vx-dot"/>已核对来源</div><div className="vx-step" data-state={running?'running':'done'}><span className="vx-dot"/>{running?'正在整理范围':'已整理范围'}</div></div></div>
   <p className="vx-meta">执行中保持展开；点击过程标题设置结束后的展开偏好。</p><div><Button size="sm" variant="ghost" onClick={()=>setRunning(v=>!v)}>{running?'完成执行示例':'开始执行示例'}</Button></div>
  </SectionCard>
 </div>
}

export function ControlsExamples() {
 const [title,setTitle]=useState('示例资料'),[scope,setScope]=useState<string|null>('current')
 return <SectionCard title="字段与范围" data-testid="controls-examples"><div className="vx-grid vx-grid--2"><Field label="资料名称" required>{props=><input {...props} className="vx-input" value={title} onChange={e=>setTitle(e.target.value)}/>}</Field><Field label="适用范围">{props=><Select {...props} value={scope} onChange={setScope} options={[{value:'current',label:'当前项目'},{value:'team',label:'团队资料'}]}/>}</Field></div><EmptyState message="暂无附加记录"/></SectionCard>
}

export function OrganismsExamples() {
 const [period,setPeriod]=useState('7')
 return <SectionCard title="处理表现" controls={<Select variant="inline" label="处理表现期间" value={period} onChange={setPeriod} options={[{value:'7',label:'近 7 天'},{value:'30',label:'近 30 天'}]}/>} updatedAt={{text:'2026-10-26 10:00',dateTime:'2026-10-26T10:00:00+08:00',detail:'示例来源快照'}} data-testid="organisms-examples">
  <div className="vx-stack"><div className="vx-metrics vx-stats--inline"><Metric label="处理件数" value={period==='7'?'24':'86'} help="选定期间内已完成的记录数。" source="示例处理记录" comparison={{value:'+12%',direction:'up',sentiment:'positive',label:'相较上一等长期间增加 12%'}}/><Metric label="待核对记录" value="3" help="需要进一步核对的记录数。" source="示例资料清单"/><Metric label="核对通过率" value="92%" help="已核对记录中通过的比例。" source="示例核对结果"/><Metric label="平均用时" value="4 小时" help="已完成记录从创建到处理完成的平均用时。" source="示例处理时间"/></div><TableScroll label="来源处理明细" minWidth={480}><table className="vx-table"><thead><tr><th>资料</th><th>状态</th><th>更新时间</th></tr></thead><tbody><tr><td>范围说明</td><td>已核对</td><td>2026-10-26 10:00</td></tr><tr><td>来源记录</td><td>待核对</td><td>2026-10-26 09:30</td></tr></tbody></table></TableScroll></div>
 </SectionCard>
}
