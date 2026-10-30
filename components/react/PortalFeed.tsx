// vincent-ux v1.5.0 · components/react/PortalFeed.tsx
// 对客门户的氛围层：几列缓慢漂移的抽象内容卡（瀑布流）。纯装饰，对读屏隐藏，不放真实业务内容。
// 外观见 templates/css/templates.css「对客门户」；减少动态效果时停住。
import type { CSSProperties } from 'react'

const SHAPES = ['tall', 'base', 'square', 'base', 'tall', 'base'] as const
const TONES = [undefined, 'warm', undefined, 'deep', undefined, undefined, 'warm'] as const

/** 每列的卡片序列按固定规则生成（不随机），每次渲染一致；列内容重复一遍以便无缝循环。 */
export function PortalFeed({ columns = 6, perColumn = 6, marks = 5 }: {
  columns?: number
  perColumn?: number
  /** 每隔几张出现一枚强调色小签（例如「上榜」），0 表示不出现。 */
  marks?: number
}) {
  return <div className="vx-portal-feed" aria-hidden="true">
    <div className="vx-portal-feed-inner">
      {Array.from({ length: columns }, (_, c) => {
        const tiles = Array.from({ length: perColumn }, (_, i) => {
          const k = c * perColumn + i
          return <div key={i} className="vx-portal-tile" data-shape={SHAPES[(k * 5 + c) % SHAPES.length]} data-tone={TONES[(k * 3 + c) % TONES.length]} data-mark={marks && k % marks === 2 ? '' : undefined}>
            <div className="vx-portal-tile-cover" /><div className="vx-portal-tile-line" /><div className="vx-portal-tile-line" /><div className="vx-portal-tile-foot" />
          </div>
        })
        return <div key={c} className="vx-portal-col" style={{ '--vx-portal-speed': `${56 + (c * 17) % 30}s` } as CSSProperties}>{tiles}{tiles.map((t, i) => <div key={`r${i}`} className="vx-portal-tile" data-shape={t.props['data-shape']} data-tone={t.props['data-tone']} data-mark={t.props['data-mark']}>{t.props.children}</div>)}</div>
      })}
    </div>
  </div>
}
