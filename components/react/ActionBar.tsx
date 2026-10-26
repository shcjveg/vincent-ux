// vincent-ux v1.4.2 · components/react/ActionBar.tsx
import type { ReactNode } from 'react'
import { Icon } from './Icon'

export type ExecutionMode = 'automatic' | 'ai' | 'manual'
export type ExecutionPlan = { mode: ExecutionMode; description: string }
export const executionLabels: Record<ExecutionMode, string> = { automatic: '自动', ai: 'AI', manual: '人工' }

/** 主动作由业务提供；执行方式、对话调整和人工接管保持同一层级。 */
export function ActionBar({ execution, children, onDiscuss, onTakeover, discussLabel = '与 AI 调整', disabled = false }: {
  execution?: ExecutionPlan
  children?: ReactNode
  discussLabel?: string
  onDiscuss?: () => void
  onTakeover?: () => void
  disabled?: boolean
}) {
  return <div className="vx-action-bar">
    {execution && <p className="vx-action-execution"><span>执行方式 · {executionLabels[execution.mode]}</span><span>{execution.description}</span></p>}
    <div className="vx-action-controls">
      {children}
      {onDiscuss && <button type="button" className="vx-btn vx-btn--ghost" disabled={disabled} onClick={onDiscuss}><Icon name="chat" size="sm" />{discussLabel}</button>}
      {onTakeover && <button type="button" className="vx-btn vx-btn--ghost" disabled={disabled} onClick={onTakeover}><Icon name="external" size="sm" />人工接管</button>}
    </div>
  </div>
}
