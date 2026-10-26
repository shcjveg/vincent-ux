// vincent-ux v1.4.2 · components/react/dateMath.ts
export const localDay=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
export const parseDay=(value:string)=>new Date(`${value}T12:00:00`)
