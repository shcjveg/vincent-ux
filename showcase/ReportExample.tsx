import { useState } from 'react'
import { Button, EmptyState, Segmented, RadioGroup, useAppliedQuery } from '../components/react'
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
  return <section className="vx-card vx-card--padded vx-stack" aria-label="明细查询">
    <form className="vx-cluster" onSubmit={event => { event.preventDefault(); void (failure?.scope === draft ? retry() : run(draft)) }}>
      <RadioGroup name="report-region" label="查询地区" value={draft} options={['华东', '华南'].map(value => ({ value, label: value }))} onChange={setDraft} />
      <Button type="submit" variant="primary" disabled={pending?.scope === draft}>{failure?.scope === draft ? '重试查询' : '查询'}</Button>
    </form>
    {pending && <p role="status" className="vx-meta">正在查询{pending.scope}…</p>}
    {failure && <div className="vx-cluster">
      <p role="alert" className="vx-field-error">{failure.scope}查询失败，结果尚未更新。</p>
      {failure.scope !== draft && <Button onClick={retry}>重试查询</Button>}
    </div>}
    {result && <>
      <div className="vx-cluster"><h3 className="vx-title">{result.scope}{city && ' / ' + city}明细</h3>
        <span className="vx-meta">{records.length} 项</span>
        <Button size="sm" onClick={() => downloadJson('report.json', { region: result.scope, city, records })}>导出当前明细</Button>
      </div>
      <Segmented label="查看城市明细" value={city ?? ''} onChange={value => setSelection(value ? { result, city: value } : null)}
        options={[{ id: '', label: '全部城市' }, ...cities.map(name => ({ id: name, label: name }))]} />
      {records.length === 0 ? <EmptyState message="当前范围没有明细" /> : <ul className="vx-rows">{records.map(row => <li className="vx-row" key={row.title}>
        <span className="vx-row-main"><span className="vx-row-title">{row.title}</span><span className="vx-row-meta">{row.city}</span></span>
        <span className="vx-meta">{row.state}</span>
      </li>)}</ul>}
    </>}
  </section>
}
