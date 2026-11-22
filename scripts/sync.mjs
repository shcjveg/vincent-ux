// Synchronize the destination against its recorded upstream version.
import { readFileSync, mkdirSync, lstatSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { distribution } from './distribution.mjs'
import { applyUpdate, fingerprint, baselineFromCopy, planUpdate, readManifest } from './sync-state.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const usage = 'node scripts/sync.mjs <目标目录> [--dry-run] [--base 旧版干净副本目录] [--react | --no-react] [--keep-local 相对路径] [--overwrite]'
function sync() {
  const { positionals, values } = parseArgs({ allowPositionals: true, options: {
    'dry-run': { type: 'boolean' }, overwrite: { type: 'boolean' }, react: { type: 'boolean' }, 'no-react': { type: 'boolean' },
    base: { type: 'string' }, 'keep-local': { type: 'string', multiple: true }, help: { type: 'boolean' },
  } })
  if (values.help) { console.log(usage); return 0 }
  if (positionals.length !== 1 || (values.react && values['no-react']))
    throw new Error(usage)
  const out = resolve(positionals[0])
  if (out === resolve(root)) throw new Error('请选择独立的使用方目录。')
  const dest = lstatSync(out, { throwIfNoEntry: false })
  if (dest && !dest.isDirectory()) throw new Error('目标必须是目录。')
  const busy = join(out, '.vincent-ux-syncing')
  if (!values['dry-run']) {
    mkdirSync(out, { recursive: true })
    try { writeFileSync(busy, process.pid + '\n', { flag: 'wx' }) }
    catch (err) { if (err.code === 'EEXIST') throw new Error('另一个同步占用 ' + busy); throw err }
  }
  try {
    const recorded = readManifest(out)
    if (values.base && recorded) throw new Error('目标已有升级清单，可直接同步。')
    const baseDir = values.base && resolve(values.base)
    if (baseDir && (baseDir === out || baseDir.startsWith(out + sep) || out.startsWith(baseDir + sep)))
      throw new Error('旧版干净副本和目标目录应分别存放。')
    const baseline = recorded ?? (baseDir && baselineFromCopy(baseDir, out))
    const react = values['no-react'] ? false : values.react || (baseline?.react ?? true)
    const pkg = JSON.parse(readFileSync(join(root, 'package.json')))
    const next = distribution(root, pkg, react)
    const changes = planUpdate(out, baseline?.files ?? {}, next, { keep: new Set(values['keep-local']), overwrite: values.overwrite })
    console.log(`Vincent UX ${baseline ? 'v' + baseline.version : '首次接入'} → v${pkg.version}（${react ? 'React + HTML' : 'HTML'}）`)
    const conflict = changes.some(item => item.action === '冲突')
    if (values['dry-run'] || conflict)
      for (const { action, name } of changes) console.log(action + ' ' + name)
    if (conflict) {
      if (!baseline) console.error('首次升级旧项目时，用 --base 指定原版本的干净同步副本。')
      console.error('两边均有改动或目标文件已存在。比较内容后可用 --keep-local <路径> 采纳本地合并结果；--overwrite 选择整批上游版本。')
      return 1
    }
    if (!values['dry-run']) {
      const files = Object.fromEntries([...next].map(([name, content]) => [name, fingerprint(content)]))
      applyUpdate(out, changes, { format: 1, version: pkg.version, react, files })
    }
    const retained = changes.filter(item => item.action === '保留').length
    console.log(`${values['dry-run'] ? '预览' : '完成'}：更新 ${changes.length - retained} 个，保留定制 ${retained} 个。接入说明见 README.md`)
    return 0
  } finally { if (!values['dry-run']) unlinkSync(busy) }
}

try { process.exitCode = sync() } catch (err) { console.error(err.message); process.exitCode = 2 }
