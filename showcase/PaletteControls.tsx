import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { PalettePicker, ThemeToggle } from '../components/react'
import palettes from '../tokens/dist/palettes.json'

const defaultId = palettes.find(palette => palette.default)!.id

const root = document.documentElement
function readPalette() {
  return palettes.find(palette => palette.id === root.dataset.palette)?.id ?? defaultId
}
function applyPalette(id: string) {
  if (id === defaultId) delete root.dataset.palette
  else root.dataset.palette = id
}
function subscribe(notify: () => void) {
  const observer = new MutationObserver(notify)
  observer.observe(root, { attributes: true, attributeFilter: ['data-palette'] })
  return () => observer.disconnect()
}

export function PaletteControls() {
  const value = useSyncExternalStore(subscribe, readPalette)
  const current = palettes.find(palette => palette.id === value)!
  return <>
    {createPortal(<PalettePicker options={palettes} value={value} onChange={applyPalette} variant="compact" />,
      document.getElementById('palette-pick')!)}
    {createPortal(<>
      <div className="sc-palette-preview">
        <div><span className="vx-meta">当前配色</span><strong aria-live="polite">{current.name}</strong></div>
        <ThemeToggle variant="inline" />
      </div>
      {current.swatches && <div className="sc-palette-source" aria-label="原案色号">
        <span>原案色号</span>{current.swatches.map((color, index) =>
          <span key={index}>{['主色', '副色', '点缀色'][index]} <code>{color}</code></span>)}
      </div>}
      <PalettePicker id="palette" options={palettes} value={value} onChange={applyPalette} />
    </>, document.querySelector('[data-palettes]')!)}
  </>
}
