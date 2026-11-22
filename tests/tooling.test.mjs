import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, cpSync, mkdirSync, unlinkSync } from 'node:fs'
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
  const guide = readFileSync(join(dir, 'README.md'), 'utf8')
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  assert.ok(guide.includes(pkg.version))
  for (const [name, version] of Object.entries(pkg.dependencies)) assert.ok(guide.includes(name + '@' + version))
  for (const [, link] of guide.matchAll(/\]\(\.\/([^)]*)\)/g)) assert.ok(existsSync(join(dir, link.split('#')[0])), link)
  const css = readFileSync(join(dir, 'styles.css'), 'utf8')
  for (const [, path] of css.matchAll(/@import '(.+)'/g)) assert.ok(existsSync(resolve(dir, path)), path)
  assert.match(sync(dir, '--no-react').stdout, /更新 0 个/)
}))
test('重复升级沿用接入模式并保留项目定制，可显式切换 React 或还原上游', () => temporary(dir => {
  assert.equal(sync(dir, '--no-react').status, 0)
  const path = join(dir, 'css/atoms.css')
  writeFileSync(path, '/* my local changes */')
  const preview = sync(dir, '--dry-run')
  assert.equal(preview.status, 0)
  assert.match(preview.stdout, /保留 css\/atoms\.css/)
  assert.equal(sync(dir).status, 0)
  assert.equal(readFileSync(path, 'utf8'), '/* my local changes */')
  assert.ok(!existsSync(join(dir, 'react')))
  assert.equal(sync(dir, '--react', '--overwrite').status, 0)
  assert.ok(existsSync(join(dir, 'react/SearchField.tsx')))
  assert.notEqual(readFileSync(path, 'utf8'), '/* my local changes */')
}))

test('有本地定制的旧副本先预览、解决同文件冲突，再按新版清单继续升级', () => temporary(dir => {
  const base = join(dir, 'pristine')
  const dest = join(dir, 'app')
  mkdirSync(join(base, 'css'), { recursive: true })
  const stamp = '/* vincent-ux v1.6.0 · styles.css */'
  writeFileSync(join(base, 'styles.css'), stamp + '\n.old {}')
  writeFileSync(join(base, 'css/atoms.css'), '/* old upstream */')
  writeFileSync(join(base, 'legacy.css'), '.old {}')
  writeFileSync(join(base, 'LICENSE'), readFileSync(join(root, 'LICENSE')))
  cpSync(base, dest, { recursive: true })
  writeFileSync(join(dest, 'css/atoms.css'), '/* product edit */')
  writeFileSync(join(dest, 'custom.css'), '/* product only */')
  unlinkSync(join(dest, 'LICENSE'))
  const oldStyle = readFileSync(join(dest, 'styles.css'), 'utf8')
  for (const args of [['--dry-run'], []]) {
    const result = sync(dest, '--base', base, ...args)
    assert.equal(result.status, 1, result.stderr)
    assert.match(result.stdout, /冲突 css\/atoms.css/)
    assert.match(result.stdout, /删除 legacy.css/)
    assert.equal(readFileSync(join(dest, 'styles.css'), 'utf8'), oldStyle)
    assert.ok(!existsSync(join(dest, 'vincent-ux.lock.json')))
  }
  const success = sync(dest, '--base', base, '--keep-local', 'css/atoms.css')
  assert.equal(success.status, 0, success.stderr)
  assert.ok(!existsSync(join(dest, 'legacy.css')))
  assert.ok(!existsSync(join(dest, 'LICENSE')))
  assert.ok(!existsSync(join(dest, 'react')))
  assert.equal(readFileSync(join(dest, 'custom.css'), 'utf8'), '/* product only */')
  assert.equal(readFileSync(join(dest, 'css/atoms.css'), 'utf8'), '/* product edit */')
  const again = sync(dest, '--dry-run')
  assert.equal(again.status, 0, again.stderr)
  assert.match(again.stdout, /更新 0 个/)
  assert.match(again.stdout, /保留 css\/atoms.css/)
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

test('图标清单、React 语义与同步的 HTML 精灵图保持完整一致', () => temporary(dir => {
  const spec=JSON.parse(readFileSync(join(root,'icons/icons.json'),'utf8'))
  const meanings=Object.values(spec.meanings).flatMap(group=>Object.keys(group).filter(key=>!key.startsWith('$'))).sort()
  const source=readFileSync(join(root,'components/react/Icon.tsx'),'utf8').split('const ICONS = {')[1].split('} satisfies')[0]
  const react=[...source.matchAll(/(?:'([^']+)'|\b([a-zA-Z][a-zA-Z0-9]*)):\s*\w+/g)].map(match=>match[1]??match[2]).sort()
  assert.deepEqual(react,meanings)
  assert.equal(sync(dir,'--no-react').status,0)
  const sprite=readFileSync(join(dir,'icons/sprite.svg'),'utf8')
  assert.deepEqual([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(match=>match[1]).sort(),meanings)
}))

test('同一行的多条声明与跨行间距采用相同检查', () => temporary(dir => {
  writeFileSync(join(dir, 'app.css'), '.results { display: grid; gap: 17px; padding-inline:\n  3px 8px; }')
  const check = spawnSync(process.execPath, [join(root, 'scripts/check.mjs'), dir], { encoding: 'utf8' })
  assert.equal(check.status, 1)
  assert.match(check.stdout, /间距 17px/)
  assert.match(check.stdout, /间距 3px/)
}))

test('同步到任意目录后可无提示接入，宿主直接用品牌色仍提示', () => temporary(dir => {
  assert.equal(sync(dir).status, 0)
  const check = () => spawnSync(process.execPath, [join(dir, 'tools/check.mjs'), dir], { encoding: 'utf8' })
  const clean = check()
  assert.equal(clean.status, 0, clean.stdout)
  assert.match(clean.stdout, /，0 条提示/)
  writeFileSync(join(dir, 'app.css'), '.submit { background: var(--vx-brand-accent); }')
  const changed = check()
  assert.equal(changed.status, 0, changed.stdout)
  assert.match(changed.stdout, /app\.css:1 页面直接用品牌色/)
  assert.match(changed.stdout, /，1 条提示/)
  writeFileSync(join(dir, 'app.css'), '.submit { padding: 17px; }')
  assert.equal(check().status, 1)
}))
