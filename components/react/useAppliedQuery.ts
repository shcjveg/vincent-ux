// vincent-ux v1.8.0 · components/react/useAppliedQuery.ts
import { useEffect, useRef, useState } from 'react'

/** A result and its submitted scope are published together. The caller owns edits and presentation. */
export function useAppliedQuery<S, T>(load: (scope: S, signal: AbortSignal) => Promise<T>) {
  const [result, setResult] = useState<{ scope: S; data: T } | null>(null)
  const [failure, setFailure] = useState<{ scope: S; cause: unknown } | null>(null)
  const [pending, setPending] = useState<{ scope: S } | null>(null)
  const active = useRef<AbortController | null>(null)
  useEffect(() => () => active.current?.abort(), [])

  async function run(scope: S) {
    const submitted = structuredClone(scope)
    active.current?.abort()
    const controller = new AbortController()
    active.current = controller
    setPending({ scope: submitted })
    setFailure(null)
    try {
      const data = await load(submitted, controller.signal)
      if (!controller.signal.aborted) setResult({ scope: submitted, data })
    } catch (cause) {
      if (!controller.signal.aborted) setFailure({ scope: submitted, cause })
    } finally {
      if (active.current === controller) {
        active.current = null
        if (!controller.signal.aborted) setPending(null)
      }
    }
  }

  return { result, pending, failure, run, retry: () => failure ? run(failure.scope) : undefined }
}
