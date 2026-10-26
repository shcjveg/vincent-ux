// vincent-ux v1.4.0 · components/react/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'secondary' | 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

// 保留按钮宽度与名称；加载时由原生 disabled 同时阻止指针、键盘和表单提交。
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading = false, disabled, type = 'button', className, children, ...rest }, ref,
) {
  return <button {...rest} ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined}
    data-loading={loading || undefined}
    className={['vx-btn', variant !== 'secondary' && `vx-btn--${variant}`, size !== 'md' && `vx-btn--${size}`, className].filter(Boolean).join(' ')}>
    {children}
  </button>
})
