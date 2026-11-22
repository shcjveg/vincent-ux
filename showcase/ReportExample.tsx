import { useRef, useState } from 'react'
import { Button, EmptyState, Icon, Segmented, RadioGroup, useAppliedQuery } from '../components/react'
import { downloadJson } from './download'

type RecordRow = { region: string; city: string; title: string; state: string }
async function loadRegion(region: string, signal: AbortSignal) {
  const response = await fetch(new URL('./report-data.json', import.meta.url), { signal })
  if (!response.ok) throw new Error('query failed')
  const rows: RecordRow[] = await response.json()
  return rows.filter(row => row.region === region)
}

export function ReportExample() {
  const [draft, setDraft] = useState('华东')
  const { result, pending, failure, run, retry } = useAppliedQuery(loadRegion)
  const [selection, setSelection] = useState<{ result: typeof result; city: string } | null>(null)
  const city = selection && selection.result === result ? selection.city : null
  const records = result?.data.filter(row => !city || row.city === city) ?? []
  const cities = [...new Set(result?.data.map(row => row.city))]
  const submit = useRef<HTMLButtonElement>(null)
  const [receipt, setReceipt] = useState('')
  const busy = pending?.scope === draft

  function exportRecords() {
    if (!result) return
    downloadJson('report.json', { region: result.scope, city, records })
    setReceipt(`已开始下载${result.scope}${city ?? ''}的 ${records.length} 项明细。`)
  }

  async function query(retryFailure = false) {
    const trigger = document.activeElement
    setReceipt('')
    await (retryFailure ? retry() : run(draft))
    // 原生禁用或移除重试按钮会释放焦点。待新结果提交到 DOM 后再还给查询入口。
    if (trigger instanceof HTMLButtonElement) requestAnimationFrame(() => {
      if (document.activeElement === document.body) submit.current?.focus({ preventScroll: true })
    })
  }

  return <section className="vx-card vx-card--padded vx-stack vx-stack--lg" aria-label="明细查询">
    <form className="vx-form-row" onSubmit={event => {
      event.preventDefault()
      if (!busy) void query()
    }}>
      <RadioGroup name="report-region" label="查询地区" value={draft} options={['华东', '华南'].map(value => ({ value, label: value }))} onChange={setDraft} />
      <Button ref={submit} type="submit" variant="primary" loading={busy}>查询</Button>
    </form>

    <div className="vx-collection sc-report-results">
      <header className="vx-results-head">
        <div className="vx-cluster">
          <h3 className="vx-title">{result ? result.scope + '明细' : '查询结果'}</h3>
          {result && <span className="vx-meta vx-num">{records.length} 项</span>}
        </div>
        <Button size="sm" disabled={!result} onClick={exportRecords}><Icon name="download" size="sm" />导出当前明细</Button>
      </header>
      {cities.length > 1 && <Segmented label="查看城市明细" value={city ?? ''} onChange={value => {
        setReceipt('')
        setSelection(value ? { result, city: value } : null)
      }} options={[{ id: '', label: '全部城市' }, ...cities.map(name => ({ id: name, label: name }))]} />}
      {failure && <div className="vx-cluster">
        <p role="alert" className="vx-field-error">{failure.scope}查询失败，结果尚未更新。</p>
        <Button size="sm" onClick={() => void query(true)}>重试查询</Button>
      </div>}
      {!result && !failure && <p className="vx-meta">{pending ? '正在查询' + pending.scope + '…' : '选择地区并查询后，可按城市查看明细。'}</p>}
      {result && records.length === 0 && <EmptyState message="当前范围没有明细" />}
      {result && records.length > 0 && <ul className="vx-rows" key={JSON.stringify([result.scope, city])}>
        {records.map(row => <li className="vx-row" key={row.title}>
          <span className="vx-row-main"><span className="vx-row-title">{row.title}</span><span className="vx-row-meta">{row.city}</span></span>
          <span className="vx-meta">{row.state}</span>
        </li>)}
      </ul>}
      <p role="status" className={receipt || (pending && result) ? 'vx-meta' : 'vx-sr-only'}>{pending ? '正在查询' + pending.scope + '…' : receipt || (result ? `${result.scope}${city ?? ''}，共 ${records.length} 项` : '')}</p>
    </div>
  </section>
}
