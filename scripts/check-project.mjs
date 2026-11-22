import { readFileSync, readdirSync, lstatSync, existsSync, realpathSync } from 'node:fs'
import { join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

export function checkProject(targets, rules, consumer = true) {
  const SPACE = new Set(rules.space)
  for (const target of targets) if (!existsSync(target)) throw new Error('检查目录不存在：' + target)
  const files = []
  const walk = (p) => {
    if (!existsSync(p) || lstatSync(p).isSymbolicLink()) return
    if (lstatSync(p).isDirectory()) {
      for (const e of readdirSync(p)) if (!['node_modules', 'dist', '.git', '.showcase-dist', 'test-results', 'playwright-report'].includes(e)) walk(join(p, e))
    } else if (['.css', '.tsx', '.ts', '.jsx', '.js', '.html'].includes(extname(p))) files.push(p)
  }
  targets.forEach(walk)

  const errors = []
  const warnings = []
  const pascal = (s) => s.split('-').map((x) => x[0].toUpperCase() + x.slice(1)).join('')
  const forbidden = rules.forbidden.flatMap((n) => [n, pascal(n)])

  for (const f of files) {
    const rel = relative(process.cwd(), f)
    const src = readFileSync(f, 'utf8')
    const digest = () => createHash('sha256').update(src).digest('hex')
    const pageCSS = consumer && extname(f) === '.css' && !rules.shippedCSS.includes(digest())
    if (consumer && /\.(tsx|jsx)$/.test(f) && digest() !== rules.iconHash && /from ['"]lucide-react['"]/.test(src))
      warnings.push(`${rel} 直接引用 lucide-react，改用 <Icon name="含义" />`)
    const code = src.replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, ' ')).replace(/^\s*\/\/.*$/gm, '')
    if (/tokens\.css$/.test(f)) continue
    code.split('\n').forEach((line, i) => {
      const at = `${rel}:${i + 1}`
      if (extname(f) === '.css' && /(#[0-9a-f]{3,8}\b|rgba?\(|hsla?\()/i.test(line) && !/var\(--/.test(line.split(':')[0])) {
        if (!/^\s*--/.test(line)) errors.push(`${at} 裸色值：${line.trim()}`)
      }
      if (pageCSS && /var\(--vx-brand-(accent|critical)(-bright)?\)/.test(line))
        warnings.push(`${at} 页面直接用品牌色。主操作使用 .vx-action 的填充与配文字色，业务状态使用 data-tone。`)
      for (const n of forbidden) {
        const re = new RegExp(`(['"\`<\\s{,])${n}(['"\`\\s/>,}])`)
        if (re.test(line) && /icon|lucide|from|<|name=/i.test(line)) errors.push(`${at} 禁用图标：${n}`)
      }
    })
    if (extname(f) === '.css') {
      const declarations = /(?:^|[;{])\s*((?:padding|margin)(?:-[\w-]+)?|(?:row-|column-)?gap|font-size|border-radius)\s*:\s*([^;}]+)/gm
      for (const match of code.matchAll(declarations)) {
        for (const size of match[2].matchAll(/(-?\d+(?:\.\d+)?)px\b/g)) {
          const at = `${rel}:${code.slice(0, match.index + match[0].indexOf(match[1])).split('\n').length}`
          const spacing = !['font-size', 'border-radius'].includes(match[1])
          if (spacing && !SPACE.has(Math.abs(Number(size[1])))) errors.push(`${at} 间距 ${size[0]} 不在设计刻度里`)
          else if (!consumer) errors.push(`${at} ${match[1]} 的 ${size[0]} 应使用对应设计变量`)
        }
      }
    }
  }

  const source = files.map(f => readFileSync(f, 'utf8')).join('\n')
  const definitions = new Set([...rules.variables, ...[...source.matchAll(/(--vx-[\w-]+)['"]?\s*:/g)].map(m => m[1])])
  for (const f of files) {
    const code = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const variable of new Set([...code.matchAll(/var\(\s*(--vx-[\w-]+)\s*\)/g)].map(m => m[1])))
      if (!definitions.has(variable)) errors.push(`${relative(process.cwd(), f)} 未定义变量：${variable}`)
  }

  return { files, errors, warnings }
}

export function report({ files, warnings, errors }) {
  for (const w of warnings) console.log('提示 ' + w)
  for (const e of errors) console.log('✗ ' + e)
  console.log(errors.length ? `\n${errors.length} 个问题，${warnings.length} 条提示` : `✓ 通过（${files.length} 个文件，${warnings.length} 条提示）`)
  return errors.length ? 1 : 0
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const targets = process.argv.slice(2)
    if (!targets.length) throw new Error('用法：node tools/check.mjs <产品源码目录...>')
    const rules = JSON.parse(readFileSync(new URL('./rules.json', import.meta.url), 'utf8'))
    process.exitCode = report(checkProject(targets, rules))
  } catch (err) { console.error(err.message); process.exitCode = 2 }
}
