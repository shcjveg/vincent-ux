import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

export function projectRules(root) {
  const read = path => readFileSync(join(root, path), 'utf8')
  const styles = readdirSync(join(root, 'components/css')).filter(f => f.endsWith('.css')).map(f => read('components/css/' + f))
  const css = [...styles, read('templates/css/templates.css'), read('tokens/dist/embedded.css')]
  const { space } = JSON.parse(read('tokens/src/base.tokens.json'))
  const hash = value => createHash('sha256').update(value).digest('hex')
  return {
    space: Object.entries(space).filter(([k]) => !k.startsWith('$')).map(([, v]) => parseFloat(v.$value)),
    forbidden: JSON.parse(read('icons/icons.json')).forbidden.names,
    variables: [...new Set(css.flatMap(src => [...src.matchAll(/(--vx-[\w-]+)['"]?\s*:/g)].map(m => m[1])))].sort(),
    shippedCSS: css.map(hash),
    iconHash: hash(read('components/react/Icon.tsx')),
  }
}
