// vincent-ux v1.5.0 · components/react/DecisionCard.tsx
// 决定卡：问题与范围 · 判断依据 · 方案比较 · 一次确认。规则见 patterns/decision.md
import { useId, useState, type HTMLAttributes, type ReactNode } from 'react'
import { Attention } from './Attention'
import { Fold } from './Fold'
import { Icon } from './Icon'
import { Button } from './Button'
import { ActionBar, type ExecutionPlan } from './ActionBar'

export type DecisionOption = { id: string; label: string; recommended?: boolean; description?: ReactNode; execution?: ExecutionPlan }

type DecisionCardProps = {
  title: string
  attention?: boolean // 当前对象仍需人处理；完成后移除标记
  tag?: ReactNode // 标题右侧的归类小标签，如所属环节
  summary?: ReactNode
  facts?: { label:string; value:ReactNode }[]
  confirmLabel?: string
  recommendation?: ReactNode
  options: DecisionOption[]
  onChoose: (id: string) => void
  onAsk?: (choice?: string) => void
  askLabel?: string
  onCustomConfirm?: (decision: string) => void
  onTakeover?: () => void
  execution?: ExecutionPlan
  extraActions?: ReactNode // 放在对话入口前的文字按钮，如「看完整依据」
  due?: string
  dueUrgent?: boolean // 时限很近时，时限文字墨色加粗（.vx-due）；待办标记由 attention 单独提供
  meta?: ReactNode
  evidence?: string[]
  evidenceBy?: string
  pending?: string // 正在执行的选项 id
  error?: string // 失败说明，保留选项以便重试
  impact?: ReactNode // 确认前必须可见的重要影响
  done?: ReactNode // 已确认时显示的结果；有值即为已确认
} & Omit<HTMLAttributes<HTMLElement>, 'title'>

export function DecisionCard({
  title, attention, tag, summary, facts, confirmLabel = '确认方案', recommendation, options, onChoose, onAsk, askLabel = '与 AI 调整', extraActions, due, dueUrgent, meta, evidence,
  evidenceBy = 'AI 整理', done, pending, error, impact, className, onCustomConfirm, onTakeover, execution, ...rest
}: DecisionCardProps) {
  const name=useId()
  const [selected,setSelected]=useState(options.find(o=>o.recommended)?.id??null)
  const [custom,setCustom]=useState('')
  const isCustom=selected==='__custom'
  const choice=options.find(o=>o.id===selected)
  const head = (
    <div className="vx-decision-head">
      <h4>{title}</h4>
      {tag}
    </div>
  )
  if (done) {
    return (
      <section {...rest} className={['vx-decision', className].filter(Boolean).join(' ')} data-done="true">
        {head}
        <p role="status">
          <Icon name="done" size="sm" /> {done}
        </p>
      </section>
    )
  }
  return (
    <section {...rest} className={['vx-decision', className].filter(Boolean).join(' ')}>
      {attention && <Attention corner />}
      {head}
      {(due || meta) && (
        <div className="vx-decision-meta">
          {due && (
            <span className="vx-decision-due" data-urgent={dueUrgent || undefined}>
              <Icon name="pending" size="sm" />
              {due}
            </span>
          )}
          {meta}
        </div>
      )}
      {facts?.length ? <dl className="vx-decision-facts">{facts.map(f=><div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl> : summary && <p>{summary}</p>}
      {impact && <p className="vx-body">{impact}</p>}
      {evidence && evidence.length>0 && <Fold summary="依据与来源" count={`${evidence.length} 项`}><ul className="vx-list">{evidence.map(e=><li key={e}>{e}</li>)}</ul><p className="vx-meta">{evidenceBy}</p></Fold>}
      <fieldset className="vx-decision-choices" disabled={Boolean(pending)} aria-busy={Boolean(pending)}>
        <legend>处理方案</legend>
        {options.map(o=><label key={o.id} className="vx-decision-choice" data-selected={selected===o.id||undefined}>
          <input className="vx-radio" type="radio" name={name} value={o.id} checked={selected===o.id} onChange={()=>setSelected(o.id)} />
          <span><span className="vx-decision-choice-label">{o.label}{o.recommended&&<span className="vx-meta">建议</span>}</span>{(o.description||(o.recommended&&recommendation))&&<span className="vx-decision-choice-note">{o.description||(o.recommended&&recommendation)}</span>}</span>
        </label>)}
        {onCustomConfirm && <label className="vx-decision-choice" data-selected={isCustom||undefined}>
          <input className="vx-radio" type="radio" name={name} checked={isCustom} onChange={()=>setSelected('__custom')} />
          <span className="vx-decision-choice-label">填写我的决定</span>
        </label>}
        {isCustom && <label className="vx-decision-custom">我的决定与限制
          <textarea className="vx-input" rows={3} value={custom} onChange={e=>setCustom(e.target.value)} placeholder="说明要做什么、适用范围与必须遵守的条件" />
        </label>}
      </fieldset>
      {error && <p className="vx-field-error" role="alert">{error}</p>}
      <ActionBar execution={isCustom?{mode:'ai',description:'按你的决定整备执行方案；涉及资金或发布时再确认具体范围。'}:choice?.execution??execution}
        discussLabel={askLabel} onDiscuss={onAsk?()=>onAsk(isCustom?custom:choice?.label):undefined} onTakeover={onTakeover} disabled={Boolean(pending)}>
        <Button variant="primary" disabled={(isCustom?!custom.trim():!choice)||Boolean(pending)} loading={Boolean(pending)&&(isCustom||pending===choice?.id)} onClick={()=>{if(isCustom&&custom.trim())onCustomConfirm?.(custom.trim());else if(choice)onChoose(choice.id)}}>{isCustom?'交给 AI 按此准备':confirmLabel}</Button>
        {extraActions}
      </ActionBar>
    </section>
  )
}
