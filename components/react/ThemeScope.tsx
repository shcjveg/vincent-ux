// vincent-ux v1.9.0 · components/react/ThemeScope.tsx
import { createContext, useContext, useState, type ComponentPropsWithoutRef } from 'react'

type Mode = 'light' | 'dark'
type ThemeContext = { element: HTMLElement | null; changeMode?: (mode: Mode) => void }
const Context = createContext<ThemeContext | undefined>(undefined)
export const useScopedTheme = () => useContext(Context)
export const useThemeContainer = () => useScopedTheme()?.element

export function ThemeScope({ palette, mode, onModeChange, className, children, ...props }: ComponentPropsWithoutRef<'div'> & {
  palette?: string
  mode?: Mode
  onModeChange?: (mode: Mode) => void
}) {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const [localMode, setLocalMode] = useState<Mode>()
  const changeMode = mode === undefined ? (next: Mode) => {
    setLocalMode(next)
    onModeChange?.(next)
  } : onModeChange
  return <div {...props} ref={setElement} className={['vx-theme', className].filter(Boolean).join(' ')} data-palette={palette} data-theme={mode ?? localMode}>
    <Context.Provider value={{ element, changeMode }}>{children}</Context.Provider>
  </div>
}
