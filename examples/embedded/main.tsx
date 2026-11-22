import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, Dialog, Field, SectionCard, ThemeScope, ThemeToggle, useDraftForm } from '../../components/react'

const storageKey = 'project-display-name'
function ProjectPreferences() {
  const [open, setOpen] = useState(false)
  const form = useDraftForm(() => {
    try { return localStorage.getItem(storageKey) || '设计项目' } catch { return '设计项目' }
  }, name => localStorage.setItem(storageKey, name))
  const busy = form.status === 'saving'

  return <ThemeScope palette="cream-ember">
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
        <ThemeToggle variant="inline" />
      </div>
    </SectionCard>
  </ThemeScope>
}
createRoot(document.getElementById('preferences')!).render(<ProjectPreferences />)
