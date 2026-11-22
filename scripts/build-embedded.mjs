// 由整页入口生成局部接入样式。宿主的按钮、标题、颜色模式和滚动设置由宿主负责。
import { readFileSync, writeFileSync } from 'node:fs'
const root = new URL('../', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')
const imports = Array.from(read('styles.css').matchAll(/@import '([^']+)';/g), match => match[1])
const top = ':where(.vx-theme:not(.vx-theme .vx-theme))'
const parts = imports.map(path => {
  const css = read(path)
  if (path === './tokens/dist/tokens.css') return css.replace(' · tokens/dist/tokens.css', ' · tokens/dist/embedded.css').replaceAll(':root', top)
  const local = css.replace(/(^|,\s*)(body|html|:root)(?=[\s,:{])/gm, '$1:scope')
  return `@scope (.vx-theme) {\n${local}\n}`
})
writeFileSync(new URL('tokens/dist/embedded.css', root), parts.join('\n'))
