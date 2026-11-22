// vincent-ux v1.7.0 · components/react/useWorkspaceLayout.ts
import { useLayoutEffect, useRef, useState } from 'react'

/** Measure the host. A collapsed rail leaves more room for an inline conversation. */
export function useWorkspaceLayout(navigationExpanded: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(el.clientWidth)
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    measure()
    return () => observer.disconnect()
  }, [])
  return {
    ref,
    drawerNavigation: width !== null && width <= 740,
    overlayChat: width !== null && width <= (navigationExpanded ? 960 : 740),
  }
}
