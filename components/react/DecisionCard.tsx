// vincent-ux v1.3.0 · components/react/DecisionCard.tsx
// 决定卡：结论 · 说明 · 推荐 · 选项 · 时限与范围 · 依据（收起）。规则见 patterns/decision.md
import type { HTMLAttributes, ReactNode } from 'react'
import { Fold } from './Fold'
import { Icon } from './Icon'
import { Button } from './Button'

export type DecisionOption = { id: string; label: string; recommended?: boolean }

type DecisionCardProps = {
  title: string
  tag?: ReactNode // 标题右侧的归类小标签，如所属环节
  summary?: ReactNode
  recommendation?: ReactNode
  options: DecisionOption[]
  onChoose: (id: string) => void
  onAsk?: () => void
  askLabel?: string
  extraActions?: ReactNode // 放在「再问问」前的文字按钮，如「看完整依据」
  due?: string
  dueUrgent?: boolean // 时限很近时，时限文字墨色加粗（.vx-due）；卡片里不加红点
  meta?: ReactNode
  evidence?: string[]
  evidenceBy?: string
  pending?: string // 正在执行的选项 id
  error?: string // 失败说明，保留选项以便重试
  impact?: ReactNode // 确认前必须可见的重要影响
  done?: ReactNode // 已确认时显示的结果；有值即为已确认
} & Omit<HTMLAttributes<HTMLElement>, 'title'>

export function DecisionCard({
  title, tag, summary, recommendation, options, onChoose, onAsk, askLabel = '再问问', extraActions, due, dueUrgent, meta, evidence,
  evidenceBy = 'AI 整理', done, pending, error, impact, className, ...rest
}: DecisionCardProps) {
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
      {head}
      {summary && <p>{summary}</p>}
      {recommendation && (
        <div className="vx-decision-rec">
          <b>推荐</b>
          {recommendation}
        </div>
      )}
      {impact && <p className="vx-body">{impact}</p>}
      {error && <p className="vx-field-error" role="alert">{error}</p>}
      <div className="vx-decision-actions" aria-busy={Boolean(pending)}>
        {options.map((o) => (
          <Button key={o.id} size="sm" variant={o.id === options.find(option => option.recommended)?.id ? 'primary' : 'secondary'}
            loading={pending === o.id} disabled={Boolean(pending)} onClick={() => onChoose(o.id)}>
            {o.label}
          </Button>
        ))}
        {extraActions}
        {onAsk && (
          <button type="button" className="vx-btn vx-btn--ghost vx-btn--sm" onClick={onAsk}>
            <Icon name="chat" size="sm" /> {askLabel}
          </button>
        )}
      </div>
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
      {evidence && evidence.length > 0 && (
        <Fold summary={`${evidenceBy}的依据`} count={`${evidence.length} 项`}>
          <div className="vx-cluster">
            {evidence.map((e) => (
              <span key={e} className="vx-tag">
                {e}
              </span>
            ))}
          </div>
        </Fold>
      )}
    </section>
  )
}
