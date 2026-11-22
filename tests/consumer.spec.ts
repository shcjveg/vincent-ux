import { test, expect } from '@playwright/test'
import { mkdtemp, symlink, rm, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { build, preview, type PreviewServer } from 'vite'

test('独立项目只依赖同步产物，整页与嵌入两种接入都能完成任务', async ({ page }) => {
  const dir = await mkdtemp(join(tmpdir(), 'vx-consumer-'))
  let server: PreviewServer | undefined
  try {
    // 模拟宿主已有的 React 依赖。使用方的构建和页面均不读展示站文件。
    await symlink(resolve('node_modules'), join(dir, 'node_modules'), 'dir')
    await writeFile(join(dir, 'package.json'), '{"type":"module"}')
    execFileSync(process.execPath, [resolve('scripts/sync.mjs'), join(dir, 'vincent-ux')])
    const tsconfig = join(dir, 'tsconfig.json')
    await writeFile(tsconfig, JSON.stringify({
      compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'Bundler',
        jsx: 'react-jsx', strict: true, skipLibCheck: true, noEmit: true, noUnusedLocals: true, noUnusedParameters: true, verbatimModuleSyntax: true },
      include: ['vincent-ux/**/*.tsx', 'vincent-ux/**/*.ts'],
    }))
    execFileSync(process.execPath, [resolve('node_modules/typescript/bin/tsc'), '-p', tsconfig])
    await build({ root: dir, configFile: false, logLevel: 'silent',
      build: { rolldownOptions: { input: ['example-react/index.html', 'example.html', 'guide.html', 'example-batch/index.html'].map(file => join(dir, 'vincent-ux', file)) } } })
    server = await preview({ root: dir, configFile: false, logLevel: 'silent', preview: { port: 0, host: '127.0.0.1' } })
    const base = server.resolvedUrls!.local[0]
    await page.goto(new URL('vincent-ux/guide.html', base).href)
    await page.getByRole('searchbox').fill('批量')
    await expect(page.getByRole('article')).toHaveCount(1)
    await page.getByRole('link', { name: '批量改交期', exact: true }).click()
    await page.getByRole('button', { name: '确认修改 2 笔订单' }).click()
    await page.getByRole('button', { name: '重试 1 笔失败订单' }).click()
    await expect(page.getByRole('status')).toContainText('全部 2 笔已更新')
    await page.goto(new URL('vincent-ux/example.html', base).href)
    await expect(page).toHaveTitle('内容库 · Vincent UX 示例')
    await page.getByRole('searchbox').fill('访谈')
    await page.getByRole('button', { name: '筛选', exact: true }).click()
    await expect(page.getByRole('listitem')).toHaveText('访谈纪要')
    await page.getByRole('searchbox').fill('没有这条记录')
    await page.getByRole('button', { name: '筛选', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('当前条件下没有内容。')
    await page.getByRole('button', { name: '清除条件' }).click()
    await expect(page.getByRole('listitem')).toHaveCount(3)

    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(new URL('vincent-ux/example-react/index.html', base).href)
    const scope = page.locator('.vx-theme')
    const hostStyle = () => page.locator('body').evaluate(el => {
      const cs = getComputedStyle(el)
      return [cs.marginTop, cs.colorScheme, cs.getPropertyValue('--vx-action-fill')]
    })
    expect(await hostStyle()).toEqual(['32px', 'normal', ''])
    expect(await page.evaluate(() => {
      const native = document.body.appendChild(document.createElement('button'))
      const border = getComputedStyle(native).borderStyle
      native.remove()
      return border
    })).not.toBe('none')
    await expect(scope).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(scope.locator('.vx-card-head')).not.toHaveCSS('padding-top', '0px')
    const title = scope.getByRole('heading', { level: 2 })
    await expect(title).toHaveText('设计项目')
    await page.evaluate(() => document.documentElement.style.fontSize = '32px')
    await expect(title).toHaveCSS('font-size', '28px')
    await page.evaluate(() => document.documentElement.style.removeProperty('font-size'))
    const edit = scope.getByRole('button', { name: '编辑名称' })
    const fill = () => edit.evaluate(el => getComputedStyle(el).backgroundColor)
    const light = await fill()
    expect(light).not.toBe('rgba(0, 0, 0, 0)')
    await scope.getByRole('button', { name: '切换到暗色' }).click()
    await expect.poll(fill).not.toBe(light)
    expect(await hostStyle()).toEqual(['32px', 'normal', ''])
    await scope.getByRole('button', { name: '切换到浅色' }).click()
    await edit.press('Enter')
    const dialog = scope.getByRole('dialog', { name: '编辑项目名称' })
    const save = dialog.getByRole('button', { name: '保存名称' })
    await expect(save).toHaveCSS('background-color', light)
    await dialog.getByRole('textbox').fill('冬季项目')
    await page.evaluate(() => {
      const write = Storage.prototype.setItem
      Storage.prototype.setItem = function() {
        Storage.prototype.setItem = write
        throw new Error('write failed')
      }
    })
    await save.click()
    await expect(dialog.getByRole('alert')).toBeVisible()
    await expect(dialog.getByRole('textbox')).toHaveValue('冬季项目')
    await expect(scope.locator('section h2.vx-title')).toHaveText('设计项目')
    await save.click()
    await expect(dialog).toHaveCount(0)
    await expect(edit).toBeFocused()
    await page.reload()
    await expect(scope.getByRole('heading')).toHaveText('冬季项目')
  } finally {
    await server?.close()
    await rm(dir, { recursive: true, force: true })
  }
})
