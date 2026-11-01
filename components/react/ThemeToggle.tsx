// vincent-ux v1.5.0 · components/react/ThemeToggle.tsx
// 左下角的明暗切换：一个半透明小圆钮，点一下在浅色与暗色之间切换，记住上次选择。
// 优先用上次的选择；没有选择时用页面写在根元素上的默认明暗（例如嵌入浅色宿主时写
// data-theme="light"），都没有时跟随系统。存不了选择的环境（沙箱 iframe）只在本次生效。
// 按钮名称说明点下去会变成什么。外观见 .vx-theme-toggle；左下角的其它浮钮让到它上方。
// variant="inline"：放进设置页之类的表单行里，不再浮在角落，图标旁写出当前模式。
import { useEffect, useState } from 'react'
import { Icon } from './Icon'

type Mode = 'light' | 'dark'
const KEY = 'vx-theme'
const system = (): Mode => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
const stored = (): Mode | null => { try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null } catch { return null } }

export function ThemeToggle({ variant = 'floating' }: { variant?: 'floating' | 'inline' } = {}) {
  const root = document.documentElement
  const [mode, setMode] = useState<Mode>(() => stored() || (root.dataset.theme as Mode) || system())
  useEffect(() => {
    const saved = stored()
    if (saved) root.dataset.theme = saved
    // 页面没有默认明暗、也没有选择过时跟随系统变化
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const follow = () => { if (!root.dataset.theme) setMode(system()) }
    media.addEventListener('change', follow)
    return () => media.removeEventListener('change', follow)
  }, [])
  const toggle = () => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    try { localStorage.setItem(KEY, next) } catch { /* 存不了时只在本次生效 */ }
    setMode(next)
  }
  if (variant === 'inline') return <button type="button" className="vx-btn vx-btn--sm vx-theme-toggle vx-theme-toggle--inline" aria-label={mode === 'dark' ? '切换到浅色' : '切换到暗色'} onClick={toggle}>
    <Icon name="theme" size="sm" />{mode === 'dark' ? '暗色' : '浅色'}
  </button>
  return <button type="button" className="vx-icon-btn vx-theme-toggle" aria-label={mode === 'dark' ? '切换到浅色' : '切换到暗色'} title={mode === 'dark' ? '浅色' : '暗色'} onClick={toggle}>
    <Icon name="theme" />
  </button>
}
