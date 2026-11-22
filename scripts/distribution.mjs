import { join } from 'node:path'
import { readFileSync, readdirSync } from 'node:fs'
import { guideFiles, portableMarkdown, requirementPage } from './guide-files.mjs'
import { projectRules } from './project-rules.mjs'

export function distribution(root, pkg, react) {
  const entries = [
    ['scripts/consumer-readme.md', 'README.md'],
    ['README.md', 'docs/system-overview.md'],
    ...guideFiles(root).map(path => [path, path]),
    ['scripts/check-project.mjs', 'tools/check.mjs'],
    ['examples/batch/index.html', 'example-batch/index.html'],
    ['examples/batch/main.js', 'example-batch/main.js'],
    ['LICENSE', 'LICENSE'],
    ['THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_NOTICES.md'],
    ['licenses/lucide.txt', 'licenses/lucide.txt'],
    ['tokens/dist/tokens.css', 'tokens.css'],
    ['tokens/dist/palettes.json', 'palettes.json'],
    ['tokens/dist/embedded.css', 'embedded.css'],
    ...readdirSync(join(root, 'components/css')).filter(f => f.endsWith('.css')).map(f => [`components/css/${f}`, `css/${f}`]),
    ['templates/css/templates.css', 'css/templates.css'],
    ['icons/dist/sprite.svg', 'icons/sprite.svg'],
    ['scripts/audit.js', 'audit.js'],
    ['styles.css', 'styles.css'],
    ['examples/basic.html', 'example.html'],
    ...(!react ? [] : [['examples/embedded/index.html', 'example-react/index.html'], ['examples/embedded/main.tsx', 'example-react/main.tsx']]),
    ...(!react ? [] : readdirSync(join(root, 'components/react')).filter(f => /\.(tsx?|jsx?)$/.test(f)).map(f => [`components/react/${f}`, `react/${f}`])),
  ]
  const destinations = new Map(entries)
  const contentMap = new Map()
  for (const [from, to] of entries) {
    let content = readFileSync(join(root, from), 'utf8')
    if (from === 'examples/batch/index.html') content = content.replace('../../styles.css', '../styles.css')
    if (from.endsWith('.md') && from !== 'scripts/consumer-readme.md') content = portableMarkdown(root, from, content, destinations, pkg.version)
    if (to === 'README.md') {
      const dependencies = Object.entries(pkg.dependencies).map(([name, version]) => name + '@' + version)
      content = content.replace('{{version}}', pkg.version).replace('{{dependencies}}', dependencies.join(' '))
    }
    if (from === 'styles.css') content = content.replace('./tokens/dist/tokens.css', './tokens.css').replaceAll('./components/css/', './css/').replace('./templates/css/', './css/')
    if (from === 'examples/embedded/index.html') content = content.replace('../../tokens/dist/embedded.css', '../embedded.css')
    if (from === 'examples/embedded/main.tsx') content = content.replace('../../components/react', '../react')
    if (from === 'examples/basic.html') content = content.replace('../styles.css', './styles.css').replaceAll('../icons/dist/sprite.svg', './icons/sprite.svg')
    contentMap.set(to, content)
  }
  contentMap.set('tools/rules.json', JSON.stringify(projectRules(root), null, 2) + '\n')
  contentMap.set('guide.html', requirementPage(contentMap.get('docs/tasks.md'), pkg.version))
  return contentMap
}
