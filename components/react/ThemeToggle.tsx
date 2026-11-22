// vincent-ux v1.8.0 · components/react/ThemeToggle.tsx
// 左下角的明暗切换：一个半透明小圆钮，点一下在浅色与暗色之间切换，记住上次选择。
// 优先用上次的选择；没有选择时用页面写在根元素上的默认明暗（例如嵌入浅色宿主时写
// data-theme="light"），都没有时跟随系统。存不了选择的环境（沙箱 iframe）只在本次生效。
// 按钮名称说明点下去会变成什么。外观见 .vx-theme-toggle；左下角的其它浮钮让到它上方。
// variant="inline"：放进设置页之类的表单行里，不再浮在角落，图标旁写出当前模式。
import { useScopedTheme } from './ThemeScope'
import { useCallback, useLayoutEffect, useSyncExternalStore } from 'react'
import { Icon } from './Icon'

type Mode = 'light' | 'dark'
const KEY = 'vx-theme'
const system = (): Mode => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
const stored = (): Mode | null => { try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null } catch { return null } }

export function ThemeToggle({ variant = 'floating' }: { variant?: 'floating' | 'inline' } = {}) {
  const scope = useScopedTheme()
  const container = scope?.element
  const current = () => {
    const el = container ?? document.documentElement
    const scheme = getComputedStyle(el).colorScheme
    return scheme === 'light' || scheme === 'dark' ? scheme : system()
  }
  const subscribe = useCallback((notify: () => void) => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const observer = new MutationObserver(notify)
    for (let el: HTMLElement | null = container ?? document.documentElement; el; el = el.parentElement) {
      observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    }
    media.addEventListener('change', notify)
    return () => { observer.disconnect(); media.removeEventListener('change', notify) }
  }, [container])
  const mode = useSyncExternalStore(subscribe, current, () => 'light' as const)
  useLayoutEffect(() => {
    const saved = container === undefined && stored()
    if (saved) document.documentElement.dataset.theme = saved
  }, [container])
  const toggle = () => {
    const next = current() === 'dark' ? 'light' : 'dark'
    if (scope) { scope.changeMode?.(next); return }
    document.documentElement.dataset.theme = next
    try { localStorage.setItem(KEY, next) } catch { /* Storage may be unavailable in an embedded host. */ }
  }
  if (variant === 'inline') return <button type="button" disabled={scope && !scope.changeMode} className="vx-btn vx-btn--sm vx-theme-toggle vx-theme-toggle--inline" aria-label={mode === 'dark' ? '切换到浅色' : '切换到暗色'} onClick={toggle}>
    <Icon name="theme" size="sm" />{mode === 'dark' ? '暗色' : '浅色'}
  </button>
  return <button type="button" disabled={scope && !scope.changeMode} className="vx-icon-btn vx-theme-toggle" aria-label={mode === 'dark' ? '切换到浅色' : '切换到暗色'} title={mode === 'dark' ? '浅色' : '暗色'} onClick={toggle}>
    <Icon name="theme" />
  </button>
}
