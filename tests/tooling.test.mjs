import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
const root = resolve(import.meta.dirname, '..')
const sync = (...args) => spawnSync(process.execPath, [join(root, 'scripts/sync.mjs'), ...args], { encoding: 'utf8' })
const temporary = fn => { const dir = mkdtempSync(join(tmpdir(), 'vx-test-')); try { fn(dir) } finally { rmSync(dir, { recursive: true, force: true }) } }

test('HTML 接入包含样式入口、图标和可运行示例；重复复制不改内容', () => temporary(dir => {
  assert.equal(sync(dir, '--no-react').status, 0)
  for (const f of ['styles.css', 'tokens.css', 'css/base.css', 'icons/sprite.svg', 'example.html', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'licenses/lucide.txt']) assert.ok(existsSync(join(dir, f)), f)
  assert.ok(!existsSync(join(dir, 'react')))
  const css = readFileSync(join(dir, 'styles.css'), 'utf8')
  for (const [, path] of css.matchAll(/@import '(.+)'/g)) assert.ok(existsSync(resolve(dir, path)), path)
  assert.match(sync(dir, '--no-react').stdout, /更新 0 个/)
}))
test('差异文件阻止整批写入；显式覆盖才替换本地修改', () => temporary(dir => {
  sync(dir, '--no-react')
  const path = join(dir, 'css/atoms.css')
  writeFileSync(path, '/* my local changes */')
  assert.equal(sync(dir).status, 1)
  assert.equal(readFileSync(path, 'utf8'), '/* my local changes */')
  assert.ok(!existsSync(join(dir, 'react')))
  assert.equal(sync(dir, '--overwrite').status, 0)
  assert.ok(existsSync(join(dir, 'react/SearchField.tsx')))
  assert.notEqual(readFileSync(path, 'utf8'), '/* my local changes */')
}))
test('dry-run 与非法参数不会写文件', () => temporary(dir => {
  const dest = join(dir, 'preview')
  assert.equal(sync(dest, '--dry-run').status, 0)
  assert.ok(!existsSync(dest))
  assert.equal(sync(dest, '--unknown').status, 2)
  assert.ok(!existsSync(dest))
}))
test('检查不存在的消费方路径返回失败', () => {
  const result = spawnSync(process.execPath, [join(root, 'scripts/check.mjs'), join(root, 'does-not-exist')])
  assert.equal(result.status, 2)
})
test('使用方引用不存在的设计变量必须失败，显式回退值允许按需接入', () => temporary(dir => {
  const path = join(dir, 'page.css')
  writeFileSync(path, '.card { background: var(--vx-bg-layer); color: var(--vx-text-primary); }')
  const check = () => spawnSync(process.execPath, [join(root, 'scripts/check.mjs'), dir], { encoding: 'utf8' })
  assert.equal(check().status, 1)
  assert.match(check().stdout, /未定义变量：--vx-bg-layer/)
  writeFileSync(path, '.card { color: var(--vx-optional, var(--vx-text-primary)); }')
  assert.equal(check().status, 0)
}))
test('辅助文字退回 3:1 时检查必须失败', () => temporary(dir => {
  for (const name of ['scripts', 'tokens', 'icons', 'components', 'templates']) cpSync(join(root, name), join(dir, name), { recursive: true })
  const path = join(dir, 'tokens/src/theme.tokens.json')
  const tokens = JSON.parse(readFileSync(path, 'utf8'))
  tokens.text.tertiary.light = '#857D72'
  writeFileSync(path, JSON.stringify(tokens))
  const result = spawnSync(process.execPath, [join(dir, 'scripts/check.mjs')], { encoding: 'utf8' })
  assert.equal(result.status, 1)
  assert.match(result.stdout, /text-tertiary/)
}))
