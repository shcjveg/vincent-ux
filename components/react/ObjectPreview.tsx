// vincent-ux v1.4.3 · components/react/ObjectPreview.tsx
import { PreviewCard } from '@base-ui/react/preview-card'
import { useState, type ReactNode, type RefCallback } from 'react'
import { Icon, type IconName } from './Icon'

/** Compact identity, a read-only hover preview, and one explicit detail action. */
export function ObjectPreview({ title, summary, image, imageAlt, fallbackIcon = 'product', preview, onOpen, triggerRef, compact = false, detailOpen = false }: {
  title: string; summary?: string; image?: string; imageAlt?: string; fallbackIcon?: IconName
  preview: ReactNode; onOpen: () => void; triggerRef?: RefCallback<HTMLElement>; compact?: boolean; detailOpen?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [failedImage, setFailedImage] = useState<string>()
  const picture = (large = false) => image && failedImage !== image
    ? <img src={image} alt={imageAlt ?? ''} onError={() => setFailedImage(image)} loading="lazy" />
    : <span className="vx-object-placeholder" aria-label="暂无图片"><Icon name={fallbackIcon} size={large ? 'lg' : 'md'} /></span>
  return <PreviewCard.Root open={open && !detailOpen} onOpenChange={setOpen}>
    <PreviewCard.Trigger delay={350} closeDelay={120} ref={triggerRef} render={<button type="button" />}
      className={`vx-object${compact ? ' vx-object--compact' : ''}`} aria-label={`查看${title}详情`} aria-haspopup="dialog"
      onClick={() => { setOpen(false); onOpen() }}>
      <span className="vx-object-image">{picture()}</span>
      <span className="vx-object-copy"><span className="vx-object-title">{title}</span>{summary && <span className="vx-object-summary">{summary}</span>}</span>
    </PreviewCard.Trigger>
    <PreviewCard.Portal>
      <PreviewCard.Positioner side="bottom" align="start" sideOffset={8} className="vx-object-positioner">
        <PreviewCard.Popup className="vx-popup vx-object-popover" aria-label={`${title}预览`}>
          <div className="vx-object-preview-image">{picture(true)}</div>
          <div className="vx-object-preview-copy"><strong>{title}</strong>{preview}</div>
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  </PreviewCard.Root>
}
