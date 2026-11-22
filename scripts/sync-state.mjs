import { createHash, randomUUID } from 'node:crypto'
import { lstatSync, readdirSync, readFileSync, writeFileSync, mkdirSync, renameSync, unlinkSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'

export const manifestName = 'vincent-ux.lock.json'
export function fingerprint(content) {
  // A release stamp alone must not turn a local customization into a two-sided edit.
  const text = content.replaceAll('\r\n', '\n').replace(/^(\s*(?:\/\/ |\/\* |<!-- |"\$source": ")vincent-ux v)\d+\.\d+\.\d+(?= · |")/gm, '$1VERSION')
  return createHash('sha256').update(text).digest('hex')
}

function child(root, name) {
  if (!name.split('/').every(part => part && part !== '.' && part !== '..' && !/[\\:]/.test(part))) throw new Error('清单路径无效：' + name)
  const parts = name.split('/')
  let path = root
  for (const [index, part] of parts.entries()) {
    path = join(path, part)
    const stat = lstatSync(path, { throwIfNoEntry: false })
    if (stat && (index === parts.length - 1 ? !stat.isFile() : !stat.isDirectory()))
      throw new Error('同步路径需要普通文件或目录：' + name)
  }
  return path
}

export function readLocal(root, name) {
  const path = child(root, name)
  try { return readFileSync(path, 'utf8') }
  catch (err) { if (err.code === 'ENOENT') return null; throw err }
}

export function readManifest(root) {
  const text = readLocal(root, manifestName)
  if (text === null) return null
  const state = JSON.parse(text)
  if (state?.format !== 1 || typeof state.react !== 'boolean' || !/^\d+\.\d+\.\d+$/.test(state.version) ||
      !state.files || typeof state.files !== 'object' || Array.isArray(state.files))
    throw new Error('无法识别同步清单 ' + manifestName)
  for (const [name, hash] of Object.entries(state.files)) {
    if (name === manifestName || typeof hash !== 'string' || !/^[0-9a-f]{64}$/.test(hash)) throw new Error('同步清单条目无效：' + name)
    child(root, name)
  }
  return state
}

function copyVersion(dir) {
  for (const file of ['styles.css', 'tokens.css']) {
    const match = readLocal(dir, file)?.match(/^\/\* vincent-ux v(\d+\.\d+\.\d+) · /)
    if (match) return match[1]
  }
}

export function baselineFromCopy(dir, out) {
  const version = copyVersion(dir)
  if (!version || readLocal(dir, 'css/atoms.css') === null) throw new Error('--base 需要由旧版 sync 生成的干净副本。')
  const localVersion = copyVersion(out)
  if (localVersion && localVersion !== version) throw new Error('旧版副本与目标目录的版本标记不同。')
  const files = {}
  function collect(folder) {
    for (const entry of readdirSync(join(dir, folder), { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const name = folder ? folder + '/' + entry.name : entry.name
      if (entry.isDirectory()) collect(name)
      else if (entry.isFile() && name !== manifestName) files[name] = fingerprint(readLocal(dir, name))
    }
  }
  collect('')
  return { version, react: Object.hasOwn(files, 'react/index.ts'), files }
}

export function planUpdate(root, baseline, next, options) {
  const changes = []
  for (const name of new Set([...Object.keys(baseline), ...next.keys()])) {
    const previous = readLocal(root, name)
    const content = next.get(name) ?? null
    if (content === previous) continue
    const base = baseline[name] ?? null
    const local = previous === null ? null : fingerprint(previous)
    const incoming = content === null ? null : fingerprint(content)
    let action
    if (local === base || local === incoming) action = content === null ? '删除' : previous === null ? '新增' : '更新'
    else if (options.keep.has(name)) action = '保留'
    else if (options.overwrite) action = content === null ? '删除' : '覆盖'
    else if (incoming === base) action = '保留'
    else action = '冲突'
    changes.push({ name, action, previous, content })
  }
  for (const name of options.keep) if (!next.has(name) && !Object.hasOwn(baseline, name)) throw new Error('未知的保留路径：' + name)
  return changes
}

function put(path, value) {
  if (value === null) { unlinkSync(path); return }
  mkdirSync(dirname(path), { recursive: true })
  const temporary = join(dirname(path), '.vx-' + randomUUID())
  try {
    writeFileSync(temporary, value, { flag: 'wx' })
    renameSync(temporary, path)
  } finally { rmSync(temporary, { force: true }) }
}

export function applyUpdate(root, changes, manifest) {
  const pending = changes.filter(item => !['保留', '冲突'].includes(item.action))
  const content = JSON.stringify(manifest, null, 2) + '\n'
  const previous = readLocal(root, manifestName)
  if (previous !== content) pending.push({ name: manifestName, content, previous })
  const applied = []
  try {
    for (const item of pending) {
      const path = child(root, item.name)
      if (readLocal(root, item.name) !== item.previous) throw new Error('文件已改变，请重新预览：' + item.name)
      put(path, item.content)
      applied.push(item)
    }
  } catch (err) {
    for (const item of applied.reverse()) put(child(root, item.name), item.previous)
    throw err
  }
}
