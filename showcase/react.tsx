import { useEffect, useState } from 'react'
import { WorkspaceDemo, ComponentStatesDemo } from './WorkspaceDemo'
import { BreadcrumbExamples } from './NavigationExamples'
import { DisclosureExamples, ControlsExamples, OrganismsExamples } from './ComponentExamples'
import { createRoot } from 'react-dom/client'
import { DataTime, EmptyState, Button, Checkbox, Collection, DecisionCard, Dialog, Field, FilterBar, Fold, Guide, Icon,
  Breadcrumbs, ThemeToggle, UserMenu, DateFilter, SortMenu, TaskStatus, TaskCard, ActionMenu, AttentionMark, AttentionTitle, ActionSummary, DetailDrawer, DrawerSection, Property, Metric, ObjectPreview, PortalFeed, SectionCard, SectionAction, SectionHeader, Pagination, RadioGroup, SearchField, Segmented, Select, SelectionBar, Switch, TableScroll, Tabs, Tip, TipProvider, type GuideStep } from '../components/react'

type Item = { id: string; title: string; type: string; status: string; summary: string; updatedAt: string }
const initialContent: Item[] = [
  { id: '1', title: '本周运营回顾', type: '报告', status: '已完成', summary: '关键变化、待办和下一步计划。', updatedAt: '2026-10-26T10:00:00+08:00' },
  { id: '2', title: '内容发布检查表', type: '模板', status: '草稿', summary: '发布前逐项核对标题、图片和目标。', updatedAt: '2026-10-25T09:00:00+08:00' },
  { id: '3', title: '访谈要点', type: '笔记', status: '已完成', summary: '整理用户提出的问题与需求。', updatedAt: '2026-10-24T11:00:00+08:00' },
  { id: '4', title: '新项目启动清单', type: '模板', status: '已完成', summary: '明确范围、负责人和交付时间。', updatedAt: '2026-10-24T11:00:00+08:00' },
  { id: '5', title: '月度数据复盘', type: '报告', status: '草稿', summary: '比较本月变化并补充原因。', updatedAt: '2026-10-23T10:00:00+08:00' },
  { id: '6', title: '产品反馈汇总', type: '笔记', status: '草稿', summary: '归纳需要进一步验证的反馈。', updatedAt: '2026-10-22T10:00:00+08:00' },
  { id: '7', title: '周会记录模板', type: '模板', status: '已完成', summary: '记录结论、负责人和截止日期。', updatedAt: '2026-10-21T10:00:00+08:00' },
  { id: '8', title: '年度规划草案', type: '报告', status: '草稿', summary: '梳理年度重点与阶段性目标。', updatedAt: '2026-10-20T10:00:00+08:00' },
]
const tour: GuideStep[] = [
  { target: 'browse-search', title: '先找到内容', text: '输入标题，再按类型或状态缩小范围。' },
  { target: 'browse-results', title: '选择适合的浏览方式', text: '列表适合快速扫描，卡片适合浏览摘要。筛选和已选项会保留。' },
]

function BrowserDemo() {
  const [content, setContent] = useState(initialContent)
  const [query, setQuery] = useState('')
  const [todo, setTodo] = useState('全部')
  const [type, setType] = useState('全部')
  const [status, setStatus] = useState('全部')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [layout, setLayout] = useState<'list' | 'grid'>('grid')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [detail, setDetail] = useState<Item | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [guide, setGuide] = useState<GuideStep[] | null>(null)
  // 草稿就是「等我完善」的待办：筛选器、选项计数、行标题红点和抽屉分区红点来自同一个集合。
  const drafts = content.filter(item => item.status === '草稿').length
  const filtered = content.filter(item => item.title.includes(query.trim()) && (type === '全部' || item.type === type) && (status === '全部' || item.status === status) && (todo === '全部' || item.status === '草稿'))
  const direction = order === 'desc' ? -1 : 1
  filtered.sort((a, b) => (Date.parse(a.updatedAt) - Date.parse(b.updatedAt)) * direction || a.id.localeCompare(b.id) * direction)
  const totalPages = Math.ceil(filtered.length / 6)
  const currentPage = Math.min(page, Math.max(1, totalPages))
  const shown = filtered.slice((currentPage - 1) * 6, currentPage * 6)
  const change = (set: (value: string) => void) => (value: string) => { set(value); setPage(1) }
  const reset = () => { setQuery(''); setType('全部'); setStatus('全部'); setTodo('全部'); setPage(1) }
  const reload = () => { setError(undefined); setLoading(true); window.setTimeout(() => setLoading(false), 600) }
  const filters = [
    ...(query ? [{ id: 'query', label: `搜索：${query}`, onRemove: () => change(setQuery)('') }] : []),
    ...(type !== '全部' ? [{ id: 'type', label: `类型：${type}`, onRemove: () => change(setType)('全部') }] : []),
    ...(status !== '全部' ? [{ id: 'status', label: `状态：${status}`, onRemove: () => change(setStatus)('全部') }] : []),
    ...(todo !== '全部' ? [{ id: 'todo', label: `待办：${todo}`, onRemove: () => change(setTodo)('全部') }] : []),
  ]
  return <div className="vx-stack vx-stack--lg" data-testid="browser-demo">
    <div data-tour="browse-search">
      <FilterBar filters={filters} onClear={reset}>
        <SearchField label="搜索内容" placeholder="搜索标题" value={query} onChange={change(setQuery)} />
        <Select variant="filter" allValue="全部" label="内容类型" value={type} onChange={change(setType)} options={['全部', '报告', '模板', '笔记'].map(value => ({ value, label: value }))} />
        <Select variant="filter" allValue="全部" label="内容状态" value={status} onChange={change(setStatus)} options={['全部', '草稿', '已完成'].map(value => ({ value, label: value }))} />
        <Select variant="filter" allValue="全部" label="待办" attention={drafts > 0} value={todo} onChange={change(setTodo)} options={[{ value: '全部', label: '全部' }, { value: '补全草稿', label: '补全草稿', attention: drafts }]} />
      </FilterBar>
    </div>
    <div className="vx-cluster">
      <Checkbox label="选择当前页" checked={shown.length > 0 && shown.every(item => selected.includes(item.id))}
        indeterminate={shown.some(item => selected.includes(item.id)) && !shown.every(item => selected.includes(item.id))}
        disabled={shown.length === 0 || loading} onChange={e => setSelected(e.target.checked ? [...new Set([...selected, ...shown.map(item => item.id)])] : selected.filter(id => !shown.some(item => item.id === id)))} />
      <span className="vx-spacer" />
      <Segmented label="浏览方式" value={layout} options={[{ id: 'list', label: '列表' }, { id: 'grid', label: '卡片' }]} onChange={setLayout} />
    </div>
    <div data-tour="browse-results">
      <Collection items={shown} getKey={item => item.id} layout={layout} total={filtered.length} label="内容结果" actions={<SortMenu order={order} onChange={next=>{setOrder(next);setPage(1)}}/>}
        loading={loading} error={error} onRetry={reload} emptyTitle="没有匹配的内容" emptyDescription="试试其他关键词，或清除筛选条件。"
        emptyAction={<Button onClick={reset}>清除筛选</Button>}
        renderItem={item => <>
          <Checkbox label="选择" aria-label={`选择${item.title}`} checked={selected.includes(item.id)} onChange={e => setSelected(e.target.checked ? [...selected, item.id] : selected.filter(id => id !== item.id))} />
          <div className="vx-browse-item-main">
            <AttentionMark on={item.status === '草稿'}><button type="button" className="vx-result-title" onClick={() => setDetail(item)}>{item.title}</button></AttentionMark>
            <p className="vx-body">{item.summary}</p>
          </div>
          <div className="vx-cluster"><span className="vx-tag">{item.type}</span><span className="vx-tag">{item.status}</span><DataTime text={item.updatedAt.slice(5,16).replace('T',' ')} dateTime={item.updatedAt} detail="示例记录更新时间 · 北京时间"/></div>
        </>} />
    </div>
    <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} disabled={loading} />
    <SelectionBar count={selected.length} hidden={selected.filter(id => !filtered.some(item => item.id === id)).length} onClear={() => setSelected([])}>
      <Button size="sm">移动到</Button>
      <Button size="sm">导出</Button>
      <Button size="sm" variant="primary">归档</Button>
    </SelectionBar>
    <details className="sc-test-tools"><summary>体验导览与不同状态</summary><div className="vx-cluster">
      <Button size="sm" onClick={() => setGuide(tour)}>开始浏览导览</Button>
      <Button size="sm" onClick={reload}>演示加载</Button>
      <Button size="sm" onClick={() => setError('暂时无法更新内容，请重试。')}>演示请求失败</Button>
      <Button size="sm" onClick={() => setGuide([{ target: 'missing-target', title: '不可用目标', text: '目标缺失时自动退出。' }])}>验证缺失目标</Button>
    </div></details>
    {detail && <ItemDrawer item={detail} onClose={() => setDetail(null)} onSave={next => { setContent(content.map(x => x.id === next.id ? next : x)); setDetail(next) }} />}
    {guide && <Guide name="浏览内容" steps={guide} onExit={() => setGuide(null)} />}
  </div>
}

/** 抽屉详情：一个编辑出口、MECE 分区、两态字段；草稿从待办进入时直接是编辑态。 */
function ItemDrawer({ item, onClose, onSave }: { item: Item; onClose: () => void; onSave: (item: Item) => void }) {
  const pending = item.status === '草稿'
  const [editing, setEditing] = useState(pending)
  const [draft, setDraft] = useState(item)
  const [error, setError] = useState<string>()
  const dirty = JSON.stringify(draft) !== JSON.stringify(item)
  const save = () => {
    if (!draft.summary.trim()) { setError('请填写摘要'); return }
    const next = { ...draft, status: draft.summary.trim().length >= 12 ? '已完成' : '草稿', updatedAt: '2026-10-27T10:00:00+08:00' }
    setError(undefined); setEditing(false); onSave(next)
  }
  const date = (iso: string) => iso.slice(0, 16).replace('T', ' ')
  return <TipProvider><DetailDrawer title={item.title} onClose={onClose} editable editing={editing} dirty={dirty}
    onEdit={() => { setDraft(item); setEditing(true) }} onCancel={() => { setDraft(item); setError(undefined); setEditing(false) }} onSave={save}>
    <DrawerSection title="基本信息">
      <div className="vx-props">
        <Property label="标题" tip="列表与搜索使用的名称" editing={editing} value={item.title}>{p => <input {...p} className="vx-input" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />}</Property>
        <Property label="类型" tip="报告、模板或笔记，可以在下拉里新增类型" editing={editing} value={item.type}>{p => <Select label={p['aria-label']} creatable value={draft.type} onChange={v => setDraft({ ...draft, type: v })} options={[...new Set(['报告', '模板', '笔记', draft.type])].map(t => ({ value: t, label: t }))} />}</Property>
        <Property label="更新时间" tip="最近一次保存的时间，系统记录" editing={editing} value={date(item.updatedAt)} />
      </div>
    </DrawerSection>
    <DrawerSection title="内容" status={<span className="vx-tag">{item.status}</span>} attention={pending}>
      <div className="vx-props">
        <Property label="摘要" tip="写满 12 个字后，草稿自动转为已完成" wide required editing={editing} error={error} value={item.summary}>{p => <textarea {...p} className="vx-textarea" rows={3} value={draft.summary} onChange={e => setDraft({ ...draft, summary: e.target.value })} />}</Property>
        <Property label="字数" tip="摘要的字数，随填写实时计算" editing={editing} value={<span className="vx-num">{(editing ? draft : item).summary.trim().length}</span>} />
      </div>
    </DrawerSection>
    <DrawerSection title="历史" defaultOpen={false}>
      <div className="vx-props">
        <Property label="处理记录" tip="每次保存追加一条，不覆盖" wide value={<table className="vx-log">
          <thead><tr><th>时间</th><th>事项</th></tr></thead>
          <tbody>
            <tr><td><time dateTime="2026-10-20T10:00">10-20 10:00</time></td><td>创建草稿</td></tr>
            <tr><td><time dateTime="2026-10-24T11:00">10-24 11:00</time></td><td>补充封面与摘要</td></tr>
          </tbody>
        </table>} />
      </div>
    </DrawerSection>
  </DetailDrawer></TipProvider>
}

function PortalDemo() {
  const [busy, setBusy] = useState<string | null>(null)
  const [signed, setSigned] = useState<string | null>(null)
  const accounts = [['品牌 A · 系列一', 'brand-a'], ['品牌 B · 系列二', 'brand-b']]
  return <main className="vx-portal" data-testid="portal-demo">
    <PortalFeed />
    <section className="vx-portal-panel">
      <div className="vx-rise" style={{ '--i': 0 } as React.CSSProperties}><p className="vx-portal-eyebrow">示例 · 客户入口</p><h1 className="vx-portal-title">内容看板</h1><p className="vx-portal-lead">{signed ? `已登录 ${signed}` : '用分配给你的账号登录。'}</p></div>
      <form className="vx-portal-form vx-rise" style={{ '--i': 1 } as React.CSSProperties} onSubmit={e => e.preventDefault()}>
        <div className="vx-portal-fields">
          <label className="vx-portal-field"><span>账号</span><input className="vx-portal-input" autoComplete="username" /></label>
          <label className="vx-portal-field"><span>密码</span><input className="vx-portal-input" type="password" autoComplete="current-password" /></label>
        </div>
        <Button type="submit" variant="primary">登录</Button>
      </form>
      <div className="vx-portal-quick vx-rise" style={{ '--i': 2 } as React.CSSProperties}>
        <span className="vx-portal-quick-caption">演示账号</span>
        {accounts.map(([name, login]) => <button key={login} type="button" className="vx-portal-account" aria-busy={busy === login || undefined}
          onClick={() => { setBusy(login); window.setTimeout(() => { setBusy(null); setSigned(name) }, 300) }}>
          <span><span className="vx-portal-account-name">{name}</span><span className="vx-portal-account-meta">{login}</span></span><Icon name="next" /></button>)}
      </div>
    </section>
  </main>
}

function InteractionDemo() {
  const [price, setPrice] = useState('28')
  const [channel, setChannel] = useState<string | null>(null)
  const [permission, setPermission] = useState<string | null>('approve')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [dialog, setDialog] = useState(false)
  const [pending, setPending] = useState<string>()
  const [decisionError, setDecisionError] = useState<string>()
  const [done, setDone] = useState<string>()
  const [decisionNote,setDecisionNote]=useState('')
  const [tab, setTab] = useState('overview')
  const [detailsTab, setDetailsTab] = useState(true)
  const error = Number(price) > 0 ? undefined : '售价要大于 0'
  return <TipProvider><div className="vx-stack vx-stack--lg">
    <form className="vx-card vx-card--padded vx-stack sc-interaction-card" aria-label="表单示例" noValidate onSubmit={e => {
      e.preventDefault(); if (busy) return
      if (error || !channel) { setMessage('请填写有效售价并选择渠道。'); return }
      setBusy(true); setMessage(''); window.setTimeout(() => { setBusy(false); setMessage('已保存设置。') }, 800)
    }}>
      <div className="vx-grid vx-grid--2">
        <Field label="售价（美元）" hint="填写大于 0 的金额。" required error={error}>{props => <input {...props} className="vx-input" type="number" name="price" value={price} onChange={e => setPrice(e.target.value)} />}</Field>
        <Field label="发布渠道" required hint="未开放的渠道不可选择。">{props => <Select {...props} name="channel" value={channel} onChange={setChannel} options={[{ value: 'web', label: '网站' }, { value: 'mail', label: '邮件' }, { value: 'coming', label: '新渠道（暂未开放）', disabled: true }]} />}</Field>
      </div>
      <Switch label="自动保存草稿" name="autosave" defaultChecked />
      <RadioGroup label="执行方式" name="permission" value={permission} onChange={setPermission} options={[{ value: 'remind', label: '只提醒' }, { value: 'approve', label: '需我批准' }, { value: 'auto', label: '自动执行', disabled: true }]} />
      <div className="vx-cluster"><Button type="submit" variant="primary" loading={busy}>保存设置</Button>
        <Tip content="保存后立即生效；只影响当前设置。"><button type="button" className="vx-icon-btn" aria-label="保存设置说明"><Icon name="info" /></button></Tip>
        <p role="status" className="vx-meta">{message}</p>
      </div>
    </form>
    <div className="vx-card vx-card--padded vx-stack sc-interaction-card">
      <h3 className="vx-title">弹层与页签</h3>
      <Dialog open={dialog} onOpenChange={setDialog} title="确认发布" description="将发布给全部团队成员；已发送的通知无法撤回。" dismissible={false}
        trigger={<Button>打开确认框</Button>} actions={<><Button onClick={() => setDialog(false)}>取消</Button><Button variant="primary" onClick={() => setDialog(false)}>发布内容</Button></>}>
        <Field label="发布备注">{props => <input {...props} className="vx-input" placeholder="选填" />}</Field>
      </Dialog>
      <Tabs label="内容页签" variant="workspace" links={[{ label: '外部看板', href: 'https://example.com/board' }]} actions={<UserMenu name="林同学" meta="内容运营 · lin@example.com" items={[{ label: '退出登录', icon: 'switch-user', onClick: () => {} }]} />} value={tab} onChange={setTab} onClose={() => setDetailsTab(false)} items={[
        { value: 'overview', label: '概览', content: <p className="vx-body">方向键切换页签，关闭后焦点回到相邻页签。</p> },
        ...(detailsTab ? [{ value: 'detail', label: '明细', closable: true, indicator:<span className="vx-dot" aria-hidden="true"/>, content: <p className="vx-body">可按 Delete 关闭本页签。</p> }] : []),
      ]} />
      {!detailsTab && <Button size="sm" onClick={() => setDetailsTab(true)}>恢复明细页签</Button>}
    </div>
    <DecisionCard attention title="是否应用新的发布设置？" summary="将更新 2 个发布渠道的默认设置。" impact="影响：仅作用于之后的新内容；已经发布的内容保持原样。"
      recommendation="先应用于新草稿，确认后再发布。" options={[{ id: 'apply', label: '应用设置', recommended: true }, { id: 'later', label: '稍后处理' }]}
      execution={{mode:'automatic',description:'保存已确认的渠道默认设置。'}} onCustomConfirm={text=>setDone(`已交给 AI 准备：${text}`)} onAsk={choice=>setDecisionNote(`带入会话：${choice??'当前事项'}`)} onTakeover={()=>setDecisionNote('人工接管：查看原始渠道设置')}
      pending={pending} error={decisionError} done={done} evidence={['来源：当前设置', '核对时间：刚刚']}
      onChoose={id => { if (pending) return; setPending(id); window.setTimeout(() => { setPending(undefined); if (!decisionError) setDecisionError('连接中断，尚未应用。请重试。'); else { setDecisionError(undefined); setDone(id === 'apply' ? '已应用设置' : '已安排稍后处理') } }, 700) }} />
    {decisionNote&&<p role="status">{decisionNote}</p>}
    <section className="vx-card vx-card--padded vx-stack" data-testid="table-demo">
      <h3 className="vx-title">同一任务里的指标与明细</h3>
      <div className="vx-stats vx-stats--inline">
        <div className="vx-stat"><span className="vx-stat-label">已完成</span><strong className="vx-stat-value">24</strong><span className="vx-stat-note">本周处理的内容</span></div>
        <div className="vx-stat"><span className="vx-stat-label">待处理</span><strong className="vx-stat-value">3</strong><span className="vx-stat-note">需要你确认</span></div>
      </div>
      <TableScroll label="处理明细" minWidth={640}>
        <table className="vx-table"><thead><tr><th>内容</th><th>负责人</th><th>状态</th><th>更新时间</th></tr></thead>
          <tbody><tr><td>本周运营回顾</td><td>产品团队</td><td>已完成</td><td>今天 10:30</td></tr><tr><td>内容发布检查表</td><td>运营团队</td><td>待确认</td><td>今天 09:15</td></tr></tbody>
        </table>
      </TableScroll>
    </section>
    <Fold summary="更多说明"><p className="vx-body">普通说明可以没有计数；内容折叠后仍保留表单状态。</p></Fold>
  </div></TipProvider>
}

type ExampleTask = { title: string; hint: string; detail: string }
const urgentTasks: ExampleTask[] = [
  { title: '确认示例收纳箱的停售范围', hint: '示例合规风险 · 48 小时内处理', detail: '涉及示例渠道 A、B 和 C。需要分别确认停售范围，完整依据应在正式提交前展示。' },
  { title: '安排 2 笔订单发货', hint: '12 小时内发出', detail: '这两笔订单即将到达发货时限。查看订单后确认仓库与物流安排，超时会计入平台发货考核。' },
]
const weeklyTasks: ExampleTask[] = [
  { title: '核对本周库存', hint: '周五前完成 · 3 款商品', detail: '核对现有库存与待发订单，确认需要补货的数量。' },
  { title: '复查商品图片', hint: '周五前完成 · 2 个渠道', detail: '确认图片尺寸、清晰度和渠道要求后再发布。' },
  { title: '整理月度经营记录', hint: '周日完成', detail: '汇总已确认的数据和需要补充说明的变化。' },
]
function MoleculesDemo() {
  const [metricPeriod,setMetricPeriod]=useState('30')
  const [metricCompare,setMetricCompare]=useState('previous')
  const [objectOpen,setObjectOpen]=useState(false)
  const [detail, setDetail] = useState<ExampleTask | null>(null)
  const taskRow = (task: ExampleTask) => <button type="button" className="vx-todo" key={task.title} onClick={() => setDetail(task)}>
    <span className="vx-todo-main"><span className="vx-todo-title">{task.title}</span><span className="vx-todo-hint">{task.hint}</span></span>
    <span className="vx-todo-go" aria-hidden="true"><Icon name="next" size="sm" /></span>
  </button>
  return <div className="vx-stack vx-stack--lg" data-testid="molecules-demo">
    <div style={{containerType:'inline-size',containerName:'render'}} data-testid="metrics-demo">
      <section className="vx-card" aria-label="指标示例">
        <SectionHeader title="工作概况" controls={<><Select label="指标期间" variant="inline" value={metricPeriod} onChange={setMetricPeriod} options={[{value:'7',label:'近 7 天'},{value:'30',label:'近 30 天'}]}/><Select label="指标对比" variant="inline" value={metricCompare} onChange={setMetricCompare} options={[{value:'previous',label:`环比前 ${metricPeriod} 天`},{value:'none',label:'不比较'}]}/></>}/>
        <div className="vx-card-body"><TipProvider><div className="vx-metrics vx-metrics--overview vx-stats--inline">
          {[{label:'已完成任务',value:metricPeriod==='30'?'1,284':'312',help:'期间内已收到成功回执的任务数。',delta:'12.4%',direction:'up' as const},{label:'处理时长',value:metricPeriod==='30'?'3.2 分钟':'2.8 分钟',help:'从开始执行到收到回执的平均时长。',delta:'8.6%',direction:'down' as const},{label:'成功率',value:metricPeriod==='30'?'98.6%':'99.1%',help:'成功完成的任务 ÷ 全部已结束任务。',delta:'Δ +1.2%',direction:'up' as const},{label:'待处理',value:'12',help:'等待你判断或补充资料的任务数。',delta:'—',direction:undefined}].map(m=><Metric key={m.label} label={m.label} value={m.value} help={m.help} source="任务执行日志（示例）" comparison={metricCompare==='none'?undefined:{value:m.delta,direction:m.direction,sentiment:m.direction?'positive':'neutral',difference:m.label==='成功率',label:`环比前 ${metricPeriod} 天 ${m.delta}`}}/>)}
        </div></TipProvider></div>
      </section>
    </div>
    <SectionCard title="报告摘要" aria-label="板块卡片示例" controls={<span className="vx-meta">近 7 天</span>} chatAction={{label:'讨论这份报告',onClick:()=>setObjectOpen(true)}} actions={<SectionAction onClick={()=>setObjectOpen(true)}>打开报告</SectionAction>}><div className="vx-section-columns"><div className="vx-section-pane"><p>查看本周完成情况与需要继续处理的事项。</p></div><div className="vx-section-pane"><Metric label="已完成" value="128" help="期间内收到成功回执的任务数。" source="任务日志"/></div></div></SectionCard>
    <section className="vx-card vx-card--padded" aria-label="对象摘要示例">
      <ActionSummary items={[{id:'approval',label:'方案确认',count:8,urgentCount:2,onSelect:()=>setObjectOpen(true)},{id:'content',label:'内容审核',count:3,onSelect:()=>setObjectOpen(true)},{id:'review',label:'结果复核',count:0,onSelect:()=>setObjectOpen(true)}]}/>
      <ObjectPreview title="便携收纳盒" summary="折叠款 · 中号" preview={<><p>可折叠收纳，适用于桌面小物。</p><dl><dt>规格</dt><dd>中号</dd><dt>颜色</dt><dd>米白、灰色</dd></dl></>} onOpen={()=>setObjectOpen(true)} detailOpen={objectOpen}/>
      <Dialog variant="drawer" open={objectOpen} onOpenChange={setObjectOpen} title="对象详情"><p>便携收纳盒 · 折叠款</p><p>在此查看完整规格与来源链接。</p></Dialog>
    </section>
    <section className="vx-card vx-card--padded vx-todos" aria-label="待办示例">
      <Fold summary={<AttentionTitle count={urgentTasks.length}>现在处理</AttentionTitle>} defaultOpen className="vx-todo-group">{urgentTasks.map(taskRow)}</Fold>
      <Fold summary={<AttentionTitle count={weeklyTasks.length}>本周内</AttentionTitle>}>{weeklyTasks.map(taskRow)}</Fold>
    </section>
    <section className="vx-card vx-card--padded vx-stack" aria-label="商品资质示例">
      <h3 className="vx-title">商品资质</h3>
      <Fold variant="row" summary="补齐示例商品的资质材料" description="示例渠道 A · 缺少报告，暂不能上架">
        <p className="vx-body">需要取得认证报告，核对持证主体与商品信息后再提交上架。</p>
      </Fold>
      <Fold summary="已完成" count="2 件">
        <div className="vx-rows">
          <div className="vx-row"><div className="vx-row-main"><p className="vx-row-title">备货清单已更新</p><p className="vx-body">自动 · 已整理 3 条备货记录</p></div></div>
          <div className="vx-row"><div className="vx-row-main"><p className="vx-row-title">准入要求已核对</p><p className="vx-body">AI 助理 · 已标出 5 项相关要求</p></div></div>
        </div>
      </Fold>
    </section>
    <Dialog variant="drawer" open={detail !== null} onOpenChange={open => { if (!open) setDetail(null) }} title={detail?.title ?? '待办详情'} description={detail?.hint}
      actions={<Button onClick={() => setDetail(null)}>关闭详情</Button>}><p className="vx-body">{detail?.detail}</p></Dialog>
  </div>
}

const featureTour: GuideStep[] = [
  { target: 'guide-workspace', title: '工作区名称', text: '这里显示当前工作区的名称，可随时修改，便于区分不同的内容空间。' },
  { target: 'guide-preference', title: '浏览方式', text: '这里切换精简列表与摘要卡片。淡底和细边界标记当前选择，内容与选择状态会保留。' },
  { target: 'guide-save', title: '偏好保存', text: '确认后保存。完成导览只结束讲解，不会代替你提交设置。' },
]
function GuideDemo() {
  const [open, setOpen] = useState(false)
  const [visits, setVisits] = useState(0)
  const [banner, setBanner] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [routeOpen, setRouteOpen] = useState(false)
  const [name, setName] = useState('内容工作台')
  const [view, setView] = useState('list')
  const [saved, setSaved] = useState('')
  return <div className="vx-stack vx-stack--lg" data-testid="guide-demo" data-visits={visits}>
    <div className="vx-cluster"><Button onClick={() => { setBanner(false); setOpen(true) }}>开始功能导览</Button><Button onClick={() => { setBanner(true); setSaved(''); setCompleted(false); setOpen(true) }}>体验底部横向导览</Button><Button onClick={() => setRouteOpen(true)}>选择使用路线</Button><span className="vx-meta">3 步，可随时退出</span></div>
    <div className="vx-card vx-card--padded vx-stack sc-guide-sample">
      <div data-tour="guide-workspace"><Field label="工作区名称" hint="这只是本地交互示例。">{props => <input {...props} className="vx-input" value={name} onChange={e => setName(e.target.value)} />}</Field></div>
      <div className="vx-stack" data-tour="guide-preference">
        <h3 className="vx-title">默认浏览方式</h3>
        <div className="vx-grid vx-grid--2" role="group" aria-label="默认浏览方式">
          <button type="button" className="vx-choice" aria-pressed={view === 'list'} onClick={() => setView('list')}><b>精简列表</b><span className="vx-choice-desc">逐行扫描标题和状态，适合快速处理。</span></button>
          <button type="button" className="vx-choice" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><b>摘要卡片</b><span className="vx-choice-desc">留出摘要空间，适合逐项浏览。</span></button>
        </div>
      </div>
      <div className="vx-cluster"><Button variant="primary" data-tour="guide-save" onClick={() => setSaved(`已保存：${name || '未命名工作区'} · ${view === 'list' ? '精简列表' : '摘要卡片'}`)}>保存浏览偏好</Button><span className="vx-meta" role="status">{saved}</span></div>
      {open && <Guide variant={banner ? 'banner' : 'card'} name="浏览偏好导览" steps={featureTour.map((s, i) => ({ ...s, ready: !banner || i !== 2 || !!saved, go: () => setVisits(n => n + 1) }))} onExit={() => setOpen(false)} onComplete={() => { setOpen(false); setCompleted(true) }} />}
      {completed && <p role="status">导览已完成</p>}
      <Dialog variant="stage" open={routeOpen} onOpenChange={setRouteOpen} title="选择使用路线" description="选择接下来要做的事。" actions={<Button onClick={() => setRouteOpen(false)}>返回工作区</Button>}><div className="vx-grid vx-grid--2"><button className="vx-choice" onClick={() => setRouteOpen(false)}><b>设置工作区</b><span className="vx-choice-desc">先连接资料，再安排工作方式。</span></button><button className="vx-choice" onClick={() => setRouteOpen(false)}><b>开始处理工作</b><span className="vx-choice-desc">从已有任务和进展继续。</span></button></div></Dialog>
    </div>
  </div>
}

/** 导航里的配色选择：只读写根元素的 data-palette，色卡区点选也改同一个属性。 */
function PalettePick() {
  const root = document.documentElement
  const [palettes, setPalettes] = useState<{ value: string; label: string; default?: boolean }[]>([])
  const [current, setCurrent] = useState(root.dataset.palette ?? '')
  useEffect(() => {
    fetch(new URL('../tokens/dist/tokens.json', import.meta.url)).then(r => r.json())
      .then(({ palettes = {} }: { palettes?: Record<string, { name: string; default?: boolean }> }) => setPalettes(Object.entries(palettes).map(([value, p]) => ({ value, label: p.name, default: p.default }))))
    const watch = new MutationObserver(() => setCurrent(root.dataset.palette ?? ''))
    watch.observe(root, { attributes: true, attributeFilter: ['data-palette'] })
    return () => watch.disconnect()
  }, [])
  const fallback = palettes.find(p => p.default)?.value ?? null
  return <Select label="配色主题" value={current || fallback} options={palettes.map(({ value, label }) => ({ value, label }))}
    onChange={id => { if (id === fallback) delete root.dataset.palette; else root.dataset.palette = id }} />
}
createRoot(document.getElementById('palette-pick')!).render(<PalettePick />)
// 左下角明暗切换：展示页唯一的明暗入口，改根元素的 data-theme
const toggleHost = document.body.appendChild(document.createElement('div'))
createRoot(toggleHost).render(<ThemeToggle />)
createRoot(document.getElementById('browse-demo')!).render(<BrowserDemo />)
createRoot(document.getElementById('interaction-demo')!).render(<InteractionDemo />)

createRoot(document.getElementById('guide-demo')!).render(<GuideDemo />)
createRoot(document.getElementById('portal-demo')!).render(<PortalDemo />)

createRoot(document.getElementById('molecules-demo')!).render(<MoleculesDemo />)


function TaskCardDemo(){
 const [handled,setHandled]=useState(''),[history,setHistory]=useState(false),[revision,setRevision]=useState(1)
 const [completedChoice,setCompletedChoice]=useState<{id:string;text:string}>(),[completedAction,setCompletedAction]=useState<'continue'|'takeover'>()
 const [pending,setPending]=useState<'continue'|'takeover'>(),[error,setError]=useState<string>(),[failNext,setFailNext]=useState(false),[attempts,setAttempts]=useState(0)
 const [sort,setSort]=useState<'asc'|'desc'>('desc'),[date,setDate]=useState({from:'',to:'',preset:''}),[dateField,setDateField]=useState('updated')
 const fields=[{id:'updated',label:'更新时间'},...(history?[{id:'handled',label:'处理时间'}]:[])]
 const submit=(choice:{id:string;text:string},action:'continue'|'takeover')=>{
  if(pending)return
  setPending(action);setError(undefined);setAttempts(n=>n+1)
  window.setTimeout(()=>{
   setPending(undefined)
   if(failNext){setError('暂时无法提交，请重试。');setFailNext(false);return}
   setHandled(action==='continue'?choice.text:'人工接管');setCompletedChoice(choice);setCompletedAction(action)
  },600)
 }
 return <div className="vx-stack" data-testid="task-card-demo">
  {history?<Breadcrumbs headingLevel={2} items={[{label:'待办事项',onClick:()=>setHistory(false)},{label:'历史已办'}]}/>:<SectionHeader title="待办事项" actions={<Button variant="ghost" onClick={()=>setHistory(true)}><Icon name="history"/>历史已办</Button>}/>}
  <div className="vx-filterbar"><DateFilter value={date} field={dateField} fields={fields} onChange={(value,field)=>{setDate({...value,preset:value.preset??''});setDateField(field)}}/></div>
  <div className="vx-results-head"><span className="vx-meta">{(history?!!handled:!handled)?1:0} 项</span><SortMenu order={sort} onChange={setSort}/></div>
  {(history?!!handled:!handled)?<TaskCard title="资料已补齐，请确认采用当前方案继续准备。" attention={!history} status={<TaskStatus type="工作方案审批" urgency={{label:'紧急',due:history?undefined:'今天需处理',urgent:!history}} timestamps={[{label:'于',suffix:'更新',dateTime:'2026-10-25T10:00:00',text:'10/25 10:00'}]}/>}

   background={<p>本次范围与约束已经整理，确认后继续准备执行所需资料。{revision>1?`补充要求已写回当前卡片，建议版本 ${revision}。`:''}</p>}
   facts={<dl><div><dt>范围</dt><dd>当前项目与本次资料版本</dd></div></dl>}
   options={[{id:'prepare',label:'采用当前方案',description:'按当前范围继续准备，实际结果等待回执。',recommended:true}]}
   onContinue={choice=>submit(choice,'continue')} onTakeover={choice=>submit(choice,'takeover')} onDiscuss={()=>{if(!history)setRevision(n=>n+1)}}
   completedChoice={completedChoice} completedAction={completedAction}
   pending={pending} error={error} done={history}/>:<EmptyState message={history?'还没有处理记录':'当前没有待办事项'}/>}
  <details className="sc-test-tools"><summary>体验提交状态</summary><div className="vx-cluster"><Checkbox label="下次提交失败" checked={failNext} disabled={!!pending||!!handled} onChange={e=>setFailNext(e.target.checked)}/><span className="vx-meta">提交尝试：{attempts}</span></div></details>
 </div>
}
createRoot(document.getElementById('task-card-demo')!).render(<TaskCardDemo />)

createRoot(document.getElementById('session-workspace-demo')!).render(<WorkspaceDemo />)
createRoot(document.getElementById('component-states-demo')!).render(<ComponentStatesDemo />)

createRoot(document.getElementById('disclosure-demo')!).render(<DisclosureExamples />)
createRoot(document.getElementById('controls-demo')!).render(<ControlsExamples />)
createRoot(document.getElementById('organisms-demo')!).render(<OrganismsExamples />)

createRoot(document.getElementById('breadcrumbs-demo')!).render(<BreadcrumbExamples />)
