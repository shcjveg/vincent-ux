import palettes from '../../tokens/dist/palettes.json'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, Dialog, Field, PalettePicker, SectionCard, ThemeScope, ThemeToggle, useDraftForm } from '../../components/react'

const storageKey = 'project-display-name'
function ProjectPreferences() {
  const [palette, setPalette] = useState(() => {
    const requested = new URLSearchParams(location.search).get('palette')
    return palettes.find(option => option.id === requested)?.id ?? 'cream-ember'
  })
  const [mode, setMode] = useState<'light' | 'dark' | undefined>(() => {
    // 通过指南预览时接续该次选择；宿主与其他模块照常管理自己的外观。
    if (!new URLSearchParams(location.search).has('palette')) return
    try {
      const saved = localStorage.getItem('vx-theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch { /* 无存储权限时沿用系统明暗。 */ }
  })
  const [open, setOpen] = useState(false)
  const form = useDraftForm(() => {
    try { return localStorage.getItem(storageKey) || '设计项目' } catch { return '设计项目' }
  }, name => localStorage.setItem(storageKey, name))
  const busy = form.status === 'saving'

  return <ThemeScope palette={palette} mode={mode} onModeChange={setMode}>
    <SectionCard title={form.saved} headingLevel={2}>
      <div className="vx-cluster">
        <Dialog open={open} dismissible={form.draft === form.saved && !busy} onOpenChange={next => { setOpen(next); if (!next) form.discard() }}
          title="编辑项目名称" trigger={<Button variant="primary">编辑名称</Button>}
          actions={<Button variant="primary" disabled={!form.draft.trim()} loading={busy} onClick={async () => {
            if (await form.submit()) setOpen(false)
          }}>保存名称</Button>}>
          <Field label="项目名称">{props => <input {...props} className="vx-input" value={form.draft} disabled={busy}
            onChange={event => form.edit(event.target.value)} />}</Field>
          {form.status === 'error' && <p role="alert">保存失败，修改已保留。请再试一次。</p>}
        </Dialog>
        <PalettePicker options={palettes} value={palette} onChange={setPalette} variant="compact" />
        <ThemeToggle variant="inline" />
      </div>
    </SectionCard>
  </ThemeScope>
}
createRoot(document.getElementById('preferences')!).render(<ProjectPreferences />)
