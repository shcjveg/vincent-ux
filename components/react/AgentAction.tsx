// vincent-ux v1.4.2 · components/react/AgentAction.tsx
// 页面里交给 AI 的入口，两种样式固定（见 patterns/delegate.md）：
// ask：问、讲、核对、拆解，只是聊，不产出东西 → 文字按钮
// draft：起草、生成，产出一份要人审的东西 → 次按钮；它是流程中的一步时可以 primary
// 图标固定是对话气泡；不带箭头（箭头只表示去另一页）
import type { ReactNode } from 'react'
import { Button, type ButtonProps } from './Button'
import { Icon } from './Icon'

type AgentActionProps = {
  kind: 'ask' | 'draft'
  primary?: boolean
  children: ReactNode
} & Omit<ButtonProps, 'children' | 'variant'>

export function AgentAction({ kind, primary = false, children, className, ...rest }: AgentActionProps) {
  const look = kind === 'ask' ? 'vx-btn--ghost' : primary ? 'vx-btn--primary' : ''
  return (
    <Button {...rest} className={['vx-btn vx-btn--sm', look, className].filter(Boolean).join(' ')} data-agent={kind}>
      <Icon name="chat" size="sm" /> {children}
    </Button>
  )
}
