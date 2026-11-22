import { useState } from 'react'
import { Button, Checkbox, Field, Icon, RadioGroup, Select, ThemeToggle, Tip, useDraftForm } from '../components/react'
import { downloadJson } from './download'

type Settings = { price: string; channel: string | null; permission: string; autosave: boolean }
const defaults: Settings = { price: '28', channel: null, permission: 'approve', autosave: true }
const storageKey = 'vx-demo-settings-v1'

function readSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (saved && typeof saved.price === 'string' && Number(saved.price) > 0 &&
        ['web', 'mail'].includes(saved.channel) && ['remind', 'approve'].includes(saved.permission) &&
        typeof saved.autosave === 'boolean') return saved
  } catch { /* A first visit, unavailable storage or an old format uses the example defaults. */ }
  return defaults
}

export function SettingsExample() {
  const form = useDraftForm(readSettings, async snapshot => {
    await new Promise(resolve => window.setTimeout(resolve, 500))
    localStorage.setItem(storageKey, JSON.stringify(snapshot))
  })
  const { draft, saved } = form
  const busy = form.status === 'saving'
  const [message, setMessage] = useState('')
  const error = Number(draft.price) > 0 ? undefined : '售价要大于 0'

  function edit(change: Partial<Settings>) {
    form.edit(previous => ({ ...previous, ...change }))
    setMessage('')
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    if (error || !draft.channel) {
      setMessage('请填写有效售价并选择渠道。')
      return
    }
    setMessage('')
    const success = await form.submit()
    setMessage(success ? '已保存设置。' : '未能保存到此浏览器。修改已保留，可再次保存。')
  }

  return <>
    <form className="vx-card vx-card--padded vx-stack sc-interaction-card" aria-label="表单示例" noValidate onSubmit={submit}>
      <h3 className="vx-title">发布设置</h3>
      <div className="vx-grid vx-grid--2">
        <Field label="售价（美元）" hint="填写大于 0 的金额。" required error={error}>{props => <input {...props} className="vx-input" type="number" name="price" value={draft.price} disabled={busy} onChange={e => edit({ price: e.target.value })} />}</Field>
        <Field label="发布渠道" required hint="未开放的渠道不可选择。">{props => <Select {...props} name="channel" value={draft.channel} disabled={busy} onChange={channel => edit({ channel })} options={[{ value: 'web', label: '网站' }, { value: 'mail', label: '邮件' }, { value: 'coming', label: '新渠道（暂未开放）', disabled: true }]} />}</Field>
      </div>
      <Checkbox label="自动保存草稿" name="autosave" checked={draft.autosave} disabled={busy} onChange={e => edit({ autosave: e.target.checked })} />
      <RadioGroup label="执行方式" name="permission" value={draft.permission} disabled={busy} onChange={permission => edit({ permission })} options={[{ value: 'remind', label: '只提醒' }, { value: 'approve', label: '需我批准' }, { value: 'auto', label: '自动执行', disabled: true }]} />
      <div className="vx-cluster">
        <Button type="submit" variant="primary" loading={busy}>保存设置</Button>
        <Tip content="保存后立即生效；只影响当前设置。"><button type="button" className="vx-icon-btn" aria-label="保存设置说明"><Icon name="info" /></button></Tip>
        <Button disabled={busy} onClick={() => { form.discard(); setMessage('已恢复上次保存的设置。') }}>放弃修改</Button>
        <Tip content="把已保存的设置导出为文件"><Button onClick={() => { downloadJson('settings.json', saved); setMessage('已导出设置。') }}>导出设置</Button></Tip>
        <p role="status" className="vx-meta">{message}</p>
      </div>
    </form>
    <div className="vx-card vx-card--padded vx-cluster" role="group" aria-label="浏览偏好">
      <span className="vx-body">界面明暗</span><ThemeToggle variant="inline" />
    </div>
  </>
}
