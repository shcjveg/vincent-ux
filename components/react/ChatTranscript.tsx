// vincent-ux v1.9.0 · components/react/ChatTranscript.tsx
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from './Button'

export type ChatReadingPosition = { following: boolean; top: number }

// The reading thresholds scale with the transcript's actual text size.
function readingDistance(pane: HTMLDivElement) {
  return (pane.scrollHeight - pane.clientHeight - pane.scrollTop) / parseFloat(getComputedStyle(pane).lineHeight)
}

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
  const [showJump, setShowJump] = useState(false)

  useLayoutEffect(() => {
    const pane = viewport.current!
    pane.scrollTop = position.current.following ? pane.scrollHeight : position.current.top
    const update = () => {
      if (!pane.clientHeight) return
      if (position.current.following) pane.scrollTop = pane.scrollHeight
      setShowJump(!position.current.following && readingDistance(pane) > 3)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(content.current!)
    observer.observe(pane)
    return () => observer.disconnect()
  }, [])

  function remember(pane: HTMLDivElement) {
    if (!pane.clientHeight) return
    const delta = pane.scrollTop - position.current.top
    // Restoring a saved scrollTop must preserve that conversation's reading intent.
    if (delta === 0) return
    const distance = readingDistance(pane)
    const following = distance <= 0 || (delta > 0 && distance < 1)
    position.current = { following, top: pane.scrollTop }
    setShowJump(!following && distance > 3)
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
    {showJump && <Button size="sm" className="vx-transcript-jump" onClick={jumpToEnd}>跳至最新</Button>}
  </div>
}
