// vincent-ux v1.8.0 · components/react/ChatTranscript.tsx
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from './Button'

export type ChatReadingPosition = { following: boolean; top: number }

/** A transcript that grows at the end. Mount a separate instance for each conversation. */
export function ChatTranscript({ children, initialPosition, onPositionChange, label = '对话记录' }: {
  children: ReactNode
  initialPosition?: ChatReadingPosition
  onPositionChange?: (position: ChatReadingPosition) => void
  label?: string
}) {
  const viewport = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const position = useRef(initialPosition ?? { following: true, top: 0 })
  const [following, setFollowing] = useState(position.current.following)

  useLayoutEffect(() => {
    const pane = viewport.current!
    pane.scrollTop = position.current.following ? pane.scrollHeight : position.current.top
    const observer = new ResizeObserver(() => {
      if (position.current.following && pane.clientHeight) pane.scrollTop = pane.scrollHeight
    })
    observer.observe(content.current!)
    observer.observe(pane)
    return () => observer.disconnect()
  }, [])

  function remember(pane: HTMLDivElement) {
    if (!pane.clientHeight) return
    // Fractional scroll positions can leave a subpixel gap at the bottom.
    const atEnd = pane.scrollHeight - pane.clientHeight - pane.scrollTop <= 2
    position.current = { following: atEnd, top: pane.scrollTop }
    setFollowing(atEnd)
    onPositionChange?.(position.current)
  }

  function jumpToEnd() {
    const pane = viewport.current!
    pane.scrollTop = pane.scrollHeight
    remember(pane)
    pane.focus({ preventScroll: true })
  }

  return <div className="vx-transcript">
    <div ref={viewport} className="vx-chat-body" role="region" aria-label={label} tabIndex={0}
      onScroll={event => remember(event.currentTarget)}>
      <div ref={content} className="vx-transcript-content">{children}</div>
    </div>
    {!following && <Button size="sm" className="vx-transcript-jump" onClick={jumpToEnd}>跳至最新</Button>}
  </div>
}
