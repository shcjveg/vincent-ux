// vincent-ux v1.4.3 · components/react/useViewportQuery.ts
import { useSyncExternalStore } from 'react'

/** Viewport switches update immediately on resize; content keeps its own draft/state. */
export function useViewportQuery(query: string) {
  return useSyncExternalStore(
    listener => { const media = window.matchMedia(query); media.addEventListener('change', listener); return () => media.removeEventListener('change', listener) },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
