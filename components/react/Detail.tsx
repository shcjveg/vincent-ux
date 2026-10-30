// vincent-ux v1.5.0 · components/react/Detail.tsx
// 抽屉详情：一个编辑出口（DetailDrawer）、一种分区（DrawerSection）、一种字段（Property）。
// 外观见 components/css/organisms.css「抽屉详情」，规则见 components/drawer.md。
import { useEffect, useId, useState, type ReactNode } from 'react'
import { AttentionMark } from './Attention'
import { Button } from './Button'
import { Dialog } from './Dialog'
import { Icon } from './Icon'
import { TextTip } from './TextTip'

/**
 * 详情抽屉。底部只有一个出口：查看时「编辑」，编辑时「取消 / 保存」；没有可编辑字段时不出现。
 * 新建对象直接以编辑态打开（editing 恒为 true，onCancel 关闭抽屉）。
 */
export function DetailDrawer({ title, onClose, editable, editing, onEdit, onCancel, onSave, saving = false, dirty = true, children }: {
  title: string; onClose: () => void
  /** 当前账号对这个对象至少有一个可编辑字段。 */
  editable: boolean
  editing: boolean; onEdit: () => void; onCancel: () => void; onSave: () => void
  saving?: boolean
  /** 没有改动时「保存」禁用。 */
  dirty?: boolean
  children: ReactNode
}) {
  const foot = !editable ? undefined : editing
    ? <><Button variant="ghost" onClick={onCancel}>取消</Button><Button variant="primary" loading={saving} disabled={!dirty} onClick={onSave}>保存</Button></>
    : <Button onClick={onEdit}><Icon name="edit" size="sm" />编辑</Button>
  return <Dialog open variant="drawer" title={title} onOpenChange={o => { if (!o) onClose() }} actions={foot}>
    <div className="vx-drawer-sections" data-editing={editing || undefined}>{children}</div>
  </Dialog>
}

/**
 * 抽屉分区：标题在左上角；有待处理时红点在标题左上角；标题右侧是系统推导出的状态（.vx-tag）；
 * 行尾只放不属于字段的少量动作（例如重新采集）。分区之间只有一道极细线。
 * 极简收起：点标题行收起或展开；收起时只留红点、标题、状态与箭头。有待处理（attention）时自动展开。
 */
export function DrawerSection({ title, status, attention = false, actions, defaultOpen = true, children }: {
  title: string; status?: ReactNode; attention?: boolean; actions?: ReactNode
  /** 首次打开时是否展开；带红点的分区总是展开。 */
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen || attention)
  useEffect(() => { if (attention) setOpen(true) }, [attention])
  const id = useId()
  return <section className="vx-drawer-section" aria-label={title} data-open={open} data-attention={attention ? 'endpoint' : undefined}>
    <header className="vx-drawer-section-head">
      <h3 className="vx-drawer-section-heading">
        <button type="button" className="vx-drawer-section-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          <span className="vx-drawer-section-title"><AttentionMark on={attention}>{title}</AttentionMark></span>
          {status}
          <Icon name="expand" size="sm" className="vx-drawer-section-chevron" />
        </button>
      </h3>
      {open && actions && <span className="vx-drawer-section-actions">{actions}</span>}
    </header>
    <div id={id} className="vx-drawer-section-body" hidden={!open}>{children}</div>
  </section>
}

type ControlProps = { id: string; 'aria-label': string; required?: boolean; 'aria-describedby'?: string; 'aria-invalid'?: true }
const empty = (v: ReactNode) => v == null || v === '' || v === false || (Array.isArray(v) && v.length === 0)

/**
 * 属性字段：只有可编辑与不可编辑两种状态，两种状态都是「名称在上、值在下」，放在同一个两列栅格（.vx-props）里。
 * 名称统一用虚线下划线承载口径说明（tip）；计算字段不传 children，永远是不可编辑态。
 */
export function Property({ label, tip, editing = false, value, wide = false, required = false, error, children }: {
  label: string; tip?: ReactNode
  /** 抽屉处于编辑态。只有同时传了 children（控件）的字段才变为可编辑。 */
  editing?: boolean
  /** 不可编辑态显示的值；空值统一显示「—」。 */
  value?: ReactNode
  /** 长文本、图片、多选等独占一行。 */
  wide?: boolean
  required?: boolean; error?: string
  children?: (control: ControlProps) => ReactNode
}) {
  const id = useId()
  const live = editing && !!children
  return <div className={wide ? 'vx-prop vx-prop--wide' : 'vx-prop'} data-editing={live || undefined}>
    <span className="vx-prop-label" data-required={(live && required) || undefined}>{tip ? <TextTip label={label} content={tip} /> : label}</span>
    {live
      ? children!({ id, 'aria-label': label, required: required || undefined, 'aria-describedby': error ? `${id}-error` : undefined, 'aria-invalid': error ? true : undefined })
      : <div className="vx-prop-value">{empty(value) ? <span className="vx-prop-empty">—</span> : value}</div>}
    {live && error && <p id={`${id}-error`} className="vx-field-error" role="alert">{error}</p>}
  </div>
}
