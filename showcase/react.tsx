import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, Checkbox, Collection, DecisionCard, Dialog, Field, FilterBar, Fold, Guide, Icon,
  Pagination, RadioGroup, SearchField, Segmented, Select, Switch, TableScroll, Tabs, Tip, TipProvider, type GuideStep } from '../components/react'

type Item = { id: string; title: string; type: string; status: string; summary: string }
const content: Item[] = [
  { id: '1', title: '本周运营回顾', type: '报告', status: '已完成', summary: '关键变化、待办和下一步计划。' },
  { id: '2', title: '内容发布检查表', type: '模板', status: '草稿', summary: '发布前逐项核对标题、图片和目标。' },
  { id: '3', title: '访谈要点', type: '笔记', status: '已完成', summary: '整理用户提出的问题与需求。' },
  { id: '4', title: '新项目启动清单', type: '模板', status: '已完成', summary: '明确范围、负责人和交付时间。' },
  { id: '5', title: '月度数据复盘', type: '报告', status: '草稿', summary: '比较本月变化并补充原因。' },
  { id: '6', title: '产品反馈汇总', type: '笔记', status: '草稿', summary: '归纳需要进一步验证的反馈。' },
  { id: '7', title: '周会记录模板', type: '模板', status: '已完成', summary: '记录结论、负责人和截止日期。' },
  { id: '8', title: '年度规划草案', type: '报告', status: '草稿', summary: '梳理年度重点与阶段性目标。' },
]
const tour: GuideStep[] = [
  { target: 'browse-search', title: '先找到内容', text: '输入标题，再按类型或状态缩小范围。' },
  { target: 'browse-results', title: '选择适合的浏览方式', text: '列表适合快速扫描，卡片适合浏览摘要。筛选和已选项会保留。' },
]

function BrowserDemo() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('全部')
  const [status, setStatus] = useState('全部')
  const [sort, setSort] = useState('默认顺序')
  const [layout, setLayout] = useState<'list' | 'grid'>('grid')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [detail, setDetail] = useState<Item | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [guide, setGuide] = useState<GuideStep[] | null>(null)
  const filtered = content.filter(item => item.title.includes(query.trim()) && (type === '全部' || item.type === type) && (status === '全部' || item.status === status))
  if (sort === '标题排序') filtered.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
  const totalPages = Math.ceil(filtered.length / 6)
  const currentPage = Math.min(page, Math.max(1, totalPages))
  const shown = filtered.slice((currentPage - 1) * 6, currentPage * 6)
  const change = (set: (value: string) => void) => (value: string) => { set(value); setPage(1) }
  const reset = () => { setQuery(''); setType('全部'); setStatus('全部'); setPage(1) }
  const reload = () => { setError(undefined); setLoading(true); window.setTimeout(() => setLoading(false), 600) }
  const filters = [
    ...(query ? [{ id: 'query', label: `搜索：${query}`, onRemove: () => change(setQuery)('') }] : []),
    ...(type !== '全部' ? [{ id: 'type', label: `类型：${type}`, onRemove: () => change(setType)('全部') }] : []),
    ...(status !== '全部' ? [{ id: 'status', label: `状态：${status}`, onRemove: () => change(setStatus)('全部') }] : []),
  ]
  return <div className="vx-stack vx-stack--lg" data-testid="browser-demo">
    <div data-tour="browse-search">
      <FilterBar filters={filters} onClear={reset}>
        <SearchField label="搜索内容" placeholder="搜索标题" value={query} onChange={change(setQuery)} />
        <Select label="内容类型" value={type} onChange={change(setType)} options={['全部', '报告', '模板', '笔记'].map(value => ({ value, label: value === '全部' ? '全部类型' : value }))} />
        <Select label="内容状态" value={status} onChange={change(setStatus)} options={['全部', '草稿', '已完成'].map(value => ({ value, label: value === '全部' ? '全部状态' : value }))} />
        <Select label="排序" value={sort} onChange={change(setSort)} options={['默认顺序', '标题排序'].map(value => ({ value, label: value }))} />
      </FilterBar>
    </div>
    <div className="vx-cluster">
      <Checkbox label="选择当前页" checked={shown.length > 0 && shown.every(item => selected.includes(item.id))}
        indeterminate={shown.some(item => selected.includes(item.id)) && !shown.every(item => selected.includes(item.id))}
        disabled={shown.length === 0 || loading} onChange={e => setSelected(e.target.checked ? [...new Set([...selected, ...shown.map(item => item.id)])] : selected.filter(id => !shown.some(item => item.id === id)))} />
      <span className="vx-meta" role="status">已选 {selected.length} 项</span>
      {selected.length > 0 && <Button variant="ghost" size="sm" onClick={() => setSelected([])}>清除选择</Button>}
      <span className="vx-spacer" />
      <Segmented label="浏览方式" value={layout} options={[{ id: 'list', label: '列表' }, { id: 'grid', label: '卡片' }]} onChange={setLayout} />
    </div>
    <div data-tour="browse-results">
      <Collection items={shown} getKey={item => item.id} layout={layout} total={filtered.length} label="内容结果"
        loading={loading} error={error} onRetry={reload} emptyTitle="没有匹配的内容" emptyDescription="试试其他关键词，或清除筛选条件。"
        emptyAction={<Button onClick={reset}>清除筛选</Button>}
        renderItem={item => <>
          <Checkbox label="选择" aria-label={`选择${item.title}`} checked={selected.includes(item.id)} onChange={e => setSelected(e.target.checked ? [...selected, item.id] : selected.filter(id => id !== item.id))} />
          <div className="vx-browse-item-main">
            <button type="button" className="vx-result-title" onClick={() => setDetail(item)}>{item.title}</button>
            <p className="vx-body">{item.summary}</p>
          </div>
          <div className="vx-cluster"><span className="vx-tag">{item.type}</span><span className="vx-tag">{item.status}</span></div>
        </>} />
    </div>
    <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} disabled={loading} />
    <details className="sc-test-tools"><summary>体验导览与不同状态</summary><div className="vx-cluster">
      <Button size="sm" onClick={() => setGuide(tour)}>开始浏览导览</Button>
      <Button size="sm" onClick={reload}>演示加载</Button>
      <Button size="sm" onClick={() => setError('暂时无法更新内容，请重试。')}>演示请求失败</Button>
      <Button size="sm" onClick={() => setGuide([{ target: 'missing-target', title: '不可用目标', text: '目标缺失时自动退出。' }])}>验证缺失目标</Button>
    </div></details>
    <Dialog open={detail !== null} onOpenChange={open => { if (!open) setDetail(null) }} title={detail?.title ?? '内容详情'} variant="drawer"
      description={detail?.summary} actions={<Button onClick={() => setDetail(null)}>关闭详情</Button>}>
      <div className="vx-cluster"><span className="vx-tag">{detail?.type}</span><span className="vx-tag">{detail?.status}</span></div>
    </Dialog>
    {guide && <Guide name="浏览内容" steps={guide} onExit={() => setGuide(null)} />}
  </div>
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
      <Tabs label="内容页签" variant="workspace" actions={<span className="vx-meta">工作区操作</span>} value={tab} onChange={setTab} onClose={() => setDetailsTab(false)} items={[
        { value: 'overview', label: '概览', content: <p className="vx-body">方向键切换页签，关闭后焦点回到相邻页签。</p> },
        ...(detailsTab ? [{ value: 'detail', label: '明细', closable: true, content: <p className="vx-body">可按 Delete 关闭本页签。</p> }] : []),
      ]} />
      {!detailsTab && <Button size="sm" onClick={() => setDetailsTab(true)}>恢复明细页签</Button>}
    </div>
    <DecisionCard title="是否应用新的发布设置？" summary="将更新 2 个发布渠道的默认设置。" impact="影响：仅作用于之后的新内容；已经发布的内容保持原样。"
      recommendation="先应用于新草稿，确认后再发布。" options={[{ id: 'apply', label: '应用设置', recommended: true }, { id: 'later', label: '稍后处理' }]}
      pending={pending} error={decisionError} done={done} evidence={['来源：当前设置', '核对时间：刚刚']}
      onChoose={id => { if (pending) return; setPending(id); window.setTimeout(() => { setPending(undefined); if (!decisionError) setDecisionError('连接中断，尚未应用。请重试。'); else { setDecisionError(undefined); setDone(id === 'apply' ? '已应用设置' : '已安排稍后处理') } }, 700) }} />
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
  const [detail, setDetail] = useState<ExampleTask | null>(null)
  const taskRow = (task: ExampleTask) => <button type="button" className="vx-todo" key={task.title} onClick={() => setDetail(task)}>
    <span className="vx-todo-main"><span className="vx-todo-title">{task.title}</span><span className="vx-todo-hint">{task.hint}</span></span>
    <span className="vx-todo-go" aria-hidden="true"><Icon name="next" size="sm" /></span>
  </button>
  return <div className="vx-stack vx-stack--lg" data-testid="molecules-demo">
    <section className="vx-card vx-card--padded vx-todos" aria-label="待办示例">
      <Fold summary="现在处理" count={`${urgentTasks.length} 件`} defaultOpen className="vx-todo-group">{urgentTasks.map(taskRow)}</Fold>
      <Fold summary="本周内" count={`${weeklyTasks.length} 件`}>{weeklyTasks.map(taskRow)}</Fold>
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
  const [name, setName] = useState('内容工作台')
  const [view, setView] = useState('list')
  const [saved, setSaved] = useState('')
  return <div className="vx-stack vx-stack--lg" data-testid="guide-demo" data-visits={visits}>
    <div className="vx-cluster"><Button onClick={() => setOpen(true)}>开始功能导览</Button><span className="vx-meta">3 步，可随时退出</span></div>
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
      {open && <Guide name="浏览偏好导览" steps={featureTour.map(s => ({ ...s, go: () => setVisits(n => n + 1) }))} onExit={() => setOpen(false)} />}
    </div>
  </div>
}

createRoot(document.getElementById('browse-demo')!).render(<BrowserDemo />)
createRoot(document.getElementById('interaction-demo')!).render(<InteractionDemo />)

createRoot(document.getElementById('guide-demo')!).render(<GuideDemo />)

createRoot(document.getElementById('molecules-demo')!).render(<MoleculesDemo />)
