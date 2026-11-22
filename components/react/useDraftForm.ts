// vincent-ux v1.7.0 · components/react/useDraftForm.ts
import { useRef, useState, type SetStateAction } from 'react'

/** 按提交时的快照保存。晚到的回执只更新已保存值，保留之后的输入。 */
export function useDraftForm<T>(initial: T | (() => T), persist: (snapshot: T) => void | Promise<void>) {
  const [saved, setSaved] = useState<T>(initial)
  const [draft, setDraft] = useState<T>(() => saved)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<unknown>()
  const pending = useRef(false)
  const revision = useRef(0)

  function edit(next: SetStateAction<T>) {
    revision.current++
    setDraft(next)
    if (!pending.current) { setStatus('idle'); setError(undefined) }
  }

  function discard() {
    if (!pending.current) edit(() => saved)
  }

  async function submit() {
    if (pending.current) return false
    const submittedRevision = revision.current
    pending.current = true
    setStatus('saving')
    setError(undefined)
    try {
      await persist(draft)
      setSaved(() => draft)
      setStatus(revision.current === submittedRevision ? 'saved' : 'idle')
      return true
    } catch (cause) {
      setError(() => cause)
      setStatus('error')
      return false
    } finally {
      pending.current = false
    }
  }

  return { draft, saved, edit, discard, submit, status, error }
}
