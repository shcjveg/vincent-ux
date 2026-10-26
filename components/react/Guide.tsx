// vincent-ux v1.4.2 · components/react/Guide.tsx
// 实机导览：目标完整挖空，说明卡优先固定停靠；遮挡目标时由说明卡避让。每一步先 go() 再定位；
// 找不到先用 alt，再找不到就按当前方向跳过。挖空框在步骤之间平滑移动、不闪回左上角。外观见 .vx-guide-*
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'

export type GuideStep = {
  ready?: boolean
  nextLabel?: string
  stage?: string
  target: string
  title: string
  text: string
  go?: () => void | Promise<void>
  alt?: { target: string; title: string; text: string }
}

export function Guide({ name, steps, onExit, scrollRoot, placement = 'bottom', variant = 'card', onComplete, initialStep = 0 }: { name: string; steps: GuideStep[]; onExit: () => void; onComplete?: () => void; initialStep?: number; scrollRoot?: string; placement?: 'bottom' | 'left'; variant?: 'card' | 'banner' }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const dock = useRef<Dock>(placement)
  const completeRef = useRef(onComplete ?? onExit)
  useLayoutEffect(() => { completeRef.current = onComplete ?? onExit }, [onComplete, onExit])
  const exitRef = useRef(onExit)
  useLayoutEffect(() => { exitRef.current = onExit }, [onExit])
  useLayoutEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    cardRef.current?.focus()
    return () => { if (opener?.isConnected) opener.focus() }
  }, [])
  const [i, setI] = useState(() => Math.max(0, Math.min(Math.trunc(initialStep), steps.length - 1)))
  const [dir, setDir] = useState<1 | -1>(1)
  // 当前讲解的内容；切到下一步时先留着上一步的，找到新目标再换，不闪空
  const [shown, setShown] = useState<{ target: string; title: string; text: string } | null>(null)
  const [box, setBox] = useState<Box | null>(null)
  const targetEl = useRef<HTMLElement | null>(null)
  const cur = useRef<Box | null>(null)
  const step = steps[i]
  const stepsRef = useRef(steps)
  useLayoutEffect(() => { stepsRef.current = steps }, [steps])
  // go() 会触发宿主重渲染；语义相同的步骤对象/回调重建不能重启导航。
  const stepKey = step ? JSON.stringify([step.target, step.title, step.text, step.stage, step.alt]) : ''
  const last = i === steps.length - 1
  const next = useCallback(() => { if (stepsRef.current[i]?.ready === false) return; if (last) completeRef.current(); else { setDir(1); setI(v => v + 1) } }, [last, i])
  const prev = useCallback(() => { setDir(-1); setI(v => Math.max(0, v - 1)) }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      if (e.key === 'Escape') { e.preventDefault(); exitRef.current(); return }
      const target = e.target
      if (!(target instanceof HTMLElement) || !cardRef.current?.contains(target) || target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  // 每一步只把不可见目标滚入视口；已经可见的功能保持原位，由说明卡避让。
  useLayoutEffect(() => {
    const step = stepsRef.current[i]
    if (!step) { exitRef.current(); return }
    let cancelled = false
    let tries = 0
    let timer = 0
    const skip = () => {
      if (cancelled) return
      const n = i + dir
      if (n >= 0 && n < steps.length) setI(n)
      else exitRef.current()
    }
    const find = () => {
      if (cancelled) return
      const visibleTarget = (target: string) => Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${CSS.escape(target)}"]`)).find(el => el.getClientRects().length > 0)
      const pick = [step, ...(step.alt ? [step.alt] : [])].find(c => visibleTarget(c.target))
      const el = pick && visibleTarget(pick.target)
      if (el && pick && el.getClientRects().length > 0) {
        targetEl.current = el
        setShown(pick)
        const smooth = !reduced()
        el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: smooth ? 'smooth' : 'auto' })
        return
      }
      if (tries++ < 8) return void (timer = window.setTimeout(find, 60))
      skip()
    }
    Promise.resolve().then(() => { if (!cancelled) return step.go?.() }).then(() => {
      if (!cancelled) timer = window.setTimeout(find, 40)
    }).catch(skip)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [i, dir, stepKey, steps.length, scrollRoot])

  // 挖空框每帧向目标的实时位置靠近：同页换目标时从上一个滑到下一个，页面滚动时跟着走，换页时从旧位置滑到新位置。
  // 按时间插值（约 280ms 缓出），并限制每帧最大位移，滚动途中也不会一帧跳很远
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      const el = targetEl.current
      if (el && el.isConnected) {
        const root = scrollRoot ? el.closest(scrollRoot)?.getBoundingClientRect() : undefined
        const goal = clampBox(el.getBoundingClientRect(), root)
        if (!goal) {
          if (cur.current) { cur.current = null; setBox(null) }
          raf = requestAnimationFrame(tick)
          return
        }
        const card = cardRef.current
        if (card && variant !== 'banner') {
          const layout = placeCard(goal, card.scrollHeight, dock.current, placement)
          dock.current = layout.dock
          card.dataset.placement = layout.dock
          Object.assign(card.style, { left: `${layout.left}px`, top: layout.top == null ? 'auto' : `${layout.top}px`, bottom: layout.top == null ? '24px' : 'auto', width: `${layout.width}px`, maxHeight: `${layout.maxHeight}px`, transform: 'none' })
        }
        const c = cur.current
        let nb = goal
        if (c && !reduced()) {
          const k = 1 - Math.exp(-dt / 90)
          const cap = 2.2 * dt // 每毫秒最多 2.2px
          const step = (from: number, to: number) => from + Math.max(-cap, Math.min(cap, (to - from) * k))
          nb = { left: step(c.left, goal.left), top: step(c.top, goal.top), width: step(c.width, goal.width), height: step(c.height, goal.height) }
        }
        if (!c || Math.abs(nb.left - c.left) + Math.abs(nb.top - c.top) + Math.abs(nb.width - c.width) + Math.abs(nb.height - c.height) > 0.3) {
          cur.current = nb
          setBox(nb)
        }
      } else if (cur.current) { cur.current = null; setBox(null) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scrollRoot, placement, variant])

  useLayoutEffect(() => {
    if (variant !== 'banner') return
    const card = cardRef.current
    if (!card) return
    const update = () => document.body.style.setProperty('--vx-guide-space', `${card.getBoundingClientRect().height + 32}px`)
    const observer = new ResizeObserver(update)
    observer.observe(card); update()
    return () => { observer.disconnect(); document.body.style.removeProperty('--vx-guide-space') }
  }, [variant])

  if (!step || typeof document === 'undefined') return null

  return createPortal(
    <div className={`vx-guide${variant === 'banner' ? ' vx-guide--banner' : ''}`} role="dialog" aria-modal="false" aria-label={name}>
      {box ? <div key="spotlight" className="vx-guide-hole" style={box} data-target={shown?.target} aria-hidden="true" /> : <div key="mask" className="vx-guide-mask" aria-hidden="true" />}
      <div className="vx-guide-card" ref={cardRef} tabIndex={-1}>
        <div className="vx-guide-meta">
          <span>{step.stage ?? name}</span>

          <span className="vx-count">
            {i + 1} / {steps.length}
          </span>
          <button type="button" className="vx-icon-btn" style={{ marginLeft: 'auto' }} aria-label="退出导览" onClick={onExit}>
            <Icon name="close" />
          </button>
        </div>
        <div key={shown?.target} className="vx-guide-copy" aria-live="polite" aria-atomic="true">
          <h3 className="vx-guide-title">{shown?.title ?? '正在定位…'}</h3>
          <p className="vx-guide-text">{shown?.text}</p>
        </div>
        <div className="vx-guide-actions">
          <span className="vx-spacer" />
          {i > 0 && (
            <button type="button" className="vx-btn vx-btn--sm" onClick={prev}>
              <Icon name="back" size="sm" /> 上一步
            </button>
          )}
          <button type="button" className="vx-btn vx-btn--primary vx-btn--sm" disabled={step.ready === false} onClick={next}>
            {step.nextLabel ?? (last ? '完成导览' : '下一步')} {!last && <Icon name="next" size="sm" />}
          </button>
        </div>
      </div>
    </div>, document.body,
  )
}

type Box = { left: number; top: number; width: number; height: number }

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 高亮只覆盖目标实际可见的部分；不把被遮挡的目标移到一个虚假的位置。
function clampBox(r: DOMRect, scroll?: DOMRect): Box | null {
  const pad = 6
  const left = Math.max(0, scroll?.left ?? 0, r.left - pad)
  const right = Math.min(window.innerWidth, scroll?.right ?? window.innerWidth, r.right + pad)
  const top = Math.max(0, scroll?.top ?? 0, r.top - pad)
  const bottom = Math.min(window.innerHeight, scroll?.bottom ?? window.innerHeight, r.bottom + pad)
  if (right <= left || bottom <= top) return null
  return { left, top, width: right - left, height: bottom - top }
}


type Dock = 'bottom' | 'top' | 'left' | 'right'
type CardLayout = { dock: Dock; left: number; top: number | null; width: number; maxHeight: number }

// 只移动说明卡，绝不为说明卡裁掉目标。优先保持当前停靠边，空间不足时才换边。
function placeCard(target: Box, contentHeight: number, current: Dock, preferred: Dock): CardLayout {
  const margin = 24
  const gap = 12
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(500, vw - margin * 2)
  const left = (vw - width) / 2
  const crossesCenter = target.left < left + width + gap && target.left + target.width > left - gap
  const height = vh - margin * 2
  const candidates: CardLayout[] = [
    { dock: 'bottom', left, top: null, width, maxHeight: crossesCenter ? Math.min(height, vh - margin - target.top - target.height - gap) : height },
    { dock: 'top', left, top: margin, width, maxHeight: crossesCenter ? Math.min(height, target.top - gap - margin) : height },
    { dock: 'left', left: margin, top: margin, width: Math.min(360, target.left - gap - margin), maxHeight: height },
    { dock: 'right', left: Math.max(vw - margin - 360, target.left + target.width + gap), top: margin, width: Math.min(360, vw - margin - target.left - target.width - gap), maxHeight: height },
  ]
  const order = [...new Set([current, preferred, 'bottom', 'left', 'top', 'right'])]
  const usable = candidates.filter(c => c.width >= Math.min(280, vw - margin * 2) && c.maxHeight >= Math.min(160, height))
    .sort((a, b) => order.indexOf(a.dock) - order.indexOf(b.dock))
  return usable.find(c => c.dock === current) ?? usable.find(c => c.maxHeight >= contentHeight) ?? usable[0]
    // 目标占满视口时无法同时完整容纳两者；保留真实高亮范围，说明卡限高并可滚动。
    ?? { dock: 'bottom', left, top: null, width, maxHeight: Math.min(160, height) }
}
