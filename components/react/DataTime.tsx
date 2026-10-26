// vincent-ux v1.4.2 · components/react/DataTime.tsx
export type DataTimeValue = { text:string;dateTime?:string;detail?:string;label?:string }

/** Source-provided data freshness; never invent a time from the render clock. */
export function DataTime({text,dateTime,detail,label='更新于'}:DataTimeValue) {
  return <span className="vx-data-time" title={detail}><span>{label}</span><time dateTime={dateTime}>{text}</time></span>
}
