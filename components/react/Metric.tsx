// vincent-ux v1.5.0 · components/react/Metric.tsx
import type { ReactNode } from 'react'
import { TextTip } from './TextTip'

export type MetricComparison = { value: ReactNode; direction?: 'up' | 'down' | 'flat'; label: string; sentiment?: 'positive' | 'negative' | 'neutral'; difference?: boolean }
export function DataTip({ label, definition, source }: { label: string; definition?: ReactNode; source?: ReactNode }) {
  return <TextTip label={label} content={<div className="vx-data-tip">{definition && <p>{definition}</p>}{source && <p>来源：{source}</p>}</div>} />
}

export function Metric({ label, value, help, source, comparison, note }: {
  label: string; value: ReactNode; help?: ReactNode; source?: ReactNode; comparison?: MetricComparison; note?: ReactNode
}) {
  return <div className="vx-stat">
    <div className="vx-stat-label">{help || source ? <DataTip label={label} definition={help} source={source} /> : label}</div>
    <div className="vx-stat-value">{value}</div>
    {comparison && <div className="vx-stat-comparison" data-sentiment={comparison.sentiment} aria-label={comparison.label}>
      {comparison.direction && !comparison.difference && <svg className="vx-change-arrow" viewBox="0 0 16 16" aria-hidden="true">{comparison.direction === 'up' ? <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/> : comparison.direction === 'down' ? <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5"/> : <path d="M3 8h10"/>}</svg>}
      <span>{comparison.value}</span>
    </div>}
    {note && <div className="vx-stat-note">{note}</div>}
  </div>
}
