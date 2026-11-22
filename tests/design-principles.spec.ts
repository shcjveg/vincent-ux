import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test.beforeEach(async ({ page }) => { await page.goto('/showcase/') })

async function exported(page: Page, action: () => Promise<void>) {
  const [download] = await Promise.all([page.waitForEvent('download'), action()])
  return JSON.parse(await readFile((await download.path())!, 'utf8'))
}

test('即时偏好、未提交草稿和已保存设置各自在刷新后呈现正确状态', async ({ page }) => {
  const form = page.getByRole('form', { name: '表单示例' })
  const checkbox = form.getByRole('checkbox', { name: '自动保存草稿' })
  const theme = page.getByRole('group', { name: '浏览偏好' }).getByRole('button')
  await checkbox.uncheck()
  await theme.click()
  await expect(page.locator('.vx-theme-toggle').first()).toHaveAccessibleName('暗色，切换到浅色')
  await page.reload()
  await expect(theme).toHaveText('暗色')
  await expect(checkbox).toBeChecked()
  await checkbox.uncheck()
  await form.getByRole('combobox', { name: '发布渠道' }).click()
  await page.getByRole('option', { name: '网站', exact: true }).click()
  await form.getByRole('button', { name: '保存设置', exact: true }).click()
  await expect(form.getByRole('status')).toHaveText('已保存设置。')
  await page.reload()
  await expect(checkbox).not.toBeChecked()
  await expect(form.getByRole('combobox')).toContainText('网站')
  await checkbox.check()
  const snapshot = await exported(page, () => form.getByRole('button', { name: '导出设置' }).click())
  expect(snapshot.autosave).toBe(false)
  await form.getByRole('button', { name: '放弃修改' }).click()
  await expect(checkbox).not.toBeChecked()
})

test('保存失败仍可重试同一份草稿', async ({ page }) => {
  const form = page.getByRole('form', { name: '表单示例' })
  await page.evaluate(() => {
    const write = Storage.prototype.setItem
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === 'vx-demo-settings-v1') {
        Storage.prototype.setItem = write
        throw new Error('storage unavailable')
      }
      write.call(this, key, value)
    }
  })
  await form.getByRole('combobox').click()
  await page.getByRole('option', { name: '邮件', exact: true }).click()
  const save = form.getByRole('button', { name: '保存设置', exact: true })
  await save.click()
  await expect(form.getByRole('status')).toContainText('未能保存')
  await expect(form.getByRole('combobox')).toContainText('邮件')
  await save.click()
  await expect(form.getByRole('status')).toHaveText('已保存设置。')
  await page.reload()
  await expect(form.getByRole('combobox')).toContainText('邮件')
})

for (const width of [1440, 390]) {
  test(`${width}px 门户能从同一个登录入口修正错误并进入目标账户`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const portal = page.getByTestId('portal-demo')
    const login = portal.getByRole('button', { name: '登录', exact: true })
    await login.click()
    const account = portal.getByRole('textbox', { name: '账号' })
    await expect(account).toBeFocused()
    await expect(account).toHaveAccessibleDescription('请输入演示账号。')
    await account.fill('brand-b')
    await login.press('Enter')
    const passcode = portal.getByLabel('密码', { exact: true })
    await expect(passcode).toBeFocused()
    await passcode.fill('demo')
    await passcode.press('Enter')
    await expect(portal.getByText('已登录 品牌 B · 系列二')).toBeVisible()
    await expect(portal.getByRole('heading', { name: '内容看板' })).toBeFocused()
    await portal.getByRole('button', { name: '切换账号' }).click()
    await expect(account).toBeFocused()
  })
}

test('长短和缺省摘要保留可比较的对象、状态和时间', async ({ page }) => {
  const demo = page.getByTestId('browser-demo')
  const cards = demo.locator('.vx-browse-item')
  const fields = () => cards.evaluateAll(nodes => nodes.map(card => ({
    title: card.querySelector('.vx-result-title')?.textContent,
    tags: Array.from(card.querySelectorAll('.vx-tag'), tag => tag.textContent),
    time: card.querySelector('time')?.dateTime,
  })))
  const original = await fields()
  expect(original).toContainEqual({ title: '产品反馈汇总', tags: ['笔记', '草稿'], time: '2026-10-22T10:00:00+08:00' })
  await expect(cards.filter({ hasText: '产品反馈汇总' }).locator('.vx-body')).toHaveCount(0)
  const positions = await cards.evaluateAll(nodes => nodes.map(card => ({
    rowTop: Math.round(card.getBoundingClientRect().top),
    fieldsTop: card.querySelector('.vx-tag')!.getBoundingClientRect().top,
  })))
  const adjacent = positions.filter(item => item.rowTop === positions[0].rowTop)
  expect(adjacent.length).toBeGreaterThan(1)
  expect(Math.max(...adjacent.map(item => item.fieldsTop)) - Math.min(...adjacent.map(item => item.fieldsTop))).toBeLessThanOrEqual(1)
  await demo.getByRole('button', { name: '列表', exact: true }).click()
  expect(await fields()).toEqual(original)
  await page.setViewportSize({ width: 390, height: 900 })
  await demo.getByRole('button', { name: '卡片', exact: true }).click()
  expect(await fields()).toEqual(original)
})

test('待查询条件、失败请求、下钻和明细导出共享最后成功的范围', async ({ page }) => {
  const report = page.getByRole('region', { name: '明细查询' })
  await report.getByRole('button', { name: '查询', exact: true }).click()
  await report.getByRole('button', { name: '上海', exact: true }).click()
  await expect(report.getByRole('listitem')).toHaveCount(2)
  await report.getByRole('radio', { name: '华南' }).check()
  await page.route('**/report-data.json*', route => route.fulfill({ status: 503 }), { times: 1 })
  await report.getByRole('button', { name: '查询', exact: true }).click()
  await expect(report.getByRole('alert')).toContainText('尚未更新')
  const download = () => exported(page, () => report.getByRole('button', { name: '导出当前明细' }).click())
  const old = await download()
  expect([old.region, old.city]).toEqual(['华东', '上海'])
  expect(old.records.map((row: { title: string }) => row.title)).toEqual(['核对发布范围', '补充上次发布记录'])
  await report.getByRole('button', { name: '重试查询' }).click()
  await expect(report.getByRole('heading')).toHaveText('华南明细')
  const updated = await download()
  expect(updated.city).toBeNull()
  expect(updated.records.map((row: { city: string }) => row.city)).toEqual(['广州', '深圳'])
})

test('新查询先完成时，晚到的旧响应无法改写结果', async ({ page }) => {
  const report = page.getByRole('region', { name: '明细查询' })
  // Simulate a data source that delivers its first response even after cancellation.
  await page.evaluate(() => {
    const fetchNormally = window.fetch
    window.fetch = (url, init) => {
      if (!String(url).includes('report-data.json')) return fetchNormally(url, init)
      window.fetch = fetchNormally
      return new Promise(resolve => window.addEventListener('release-first-query', () =>
        resolve(Response.json([{ region: '华东', city: '上海', title: '旧查询明细', state: '已完成' }])), { once: true }))
    }
  })
  const query = report.getByRole('button', { name: '查询', exact: true })
  await query.click()
  await expect(query).toBeDisabled()
  await report.getByRole('radio', { name: '华南' }).check()
  await query.click()
  await expect(report.getByRole('heading')).toHaveText('华南明细')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('release-first-query'))
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  })
  await expect(report.getByRole('heading')).toHaveText('华南明细')
  await expect(report.getByRole('listitem')).toHaveCount(2)
})

test('分段回复跟随底部，回读与切换会话保留位置，读者可主动返回', async ({ page }) => {
  const demo = page.getByTestId('session-workspace')
  await demo.getByRole('button', { name: '关闭示例页面' }).click()
  const input = demo.getByRole('textbox', { name: '示例对话输入' })
  const pane = demo.getByRole('region', { name: '对话记录' })
  const distance = () => pane.evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop)
  await input.fill(Array.from({ length: 35 }, (_, i) => '资料核对 ' + (i + 1)).join('\n'))
  await input.press('Enter')
  await expect.poll(distance).toBeLessThan(3)
  await expect(pane.getByText('先核对当前任务的对象、负责人和截止时间。')).toBeVisible()
  await pane.evaluate(el => { el.scrollTop = 80 })
  const jump = demo.getByRole('button', { name: '跳至最新' })
  await expect(jump).toBeVisible()
  await expect(pane.getByText('确认后保存方案，再查看本次变更的处理记录。')).toBeAttached()
  expect(await pane.evaluate(el => el.scrollTop)).toBe(80)
  await expect(input).toBeFocused()
  await demo.getByRole('button', { name: '资料核对', exact: true }).click()
  await demo.getByRole('button', { name: '关闭示例页面' }).click()
  await expect(jump).toHaveCount(0)
  await demo.getByRole('button', { name: '方案讨论', exact: true }).click()
  await expect(jump).toBeVisible()
  expect(await pane.evaluate(el => el.scrollTop)).toBe(80)
  await jump.press('Enter')
  await expect(jump).toHaveCount(0)
  await expect(pane).toBeFocused()
  await expect.poll(distance).toBeLessThan(3)
})

test('色卡、实际按钮和模式切换共用配色，选中反馈与键盘焦点正确', async ({ page }) => {
  await page.goto('/showcase/?palette=cream-ember#portal')
  const portal = page.getByTestId('portal-demo')
  const login = portal.getByRole('button', { name: '登录', exact: true })
  const picker = page.getByRole('combobox', { name: '配色主题', exact: true })
  const sample = (id: string) => page.locator(`[data-palette-id="${id}"]`)
  const colors = (el: typeof login) => el.evaluate(node => [getComputedStyle(node).backgroundColor, getComputedStyle(node).color])
  await expect(picker).toHaveText('奶油焦橙')
  const initial = await colors(sample('cream-ember'))
  expect(await colors(login)).toEqual(initial)
  await login.click()
  await expect(portal.getByRole('alert')).toHaveText('请输入演示账号。')
  const butter = sample('burgundy-butter')
  await butter.focus()
  await butter.press('Enter')
  await expect(butter).toBeFocused()
  await expect(butter).toHaveAttribute('aria-pressed', 'true')
  await expect(picker).toHaveText('松木酒红')
  const normal = await colors(butter)
  expect(normal).not.toEqual(initial)
  await expect.poll(() => colors(login)).toEqual(normal)
  await expect(page).toHaveURL(/palette=burgundy-butter/)
  await page.reload()
  await expect.poll(() => colors(login)).toEqual(normal)
  await butter.hover()
  await expect.poll(async () => (await colors(butter))[0]).not.toBe(normal[0])
  expect((await colors(butter))[1]).toBe(normal[1])
  await page.locator('#showcase-mode button').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect.poll(async () => (await colors(login))[0]).not.toBe(normal[0])
  await expect(async () => {
    expect(await colors(butter)).toEqual(await colors(login))
  }).toPass({ timeout: 5000 })
  await picker.click()
  await page.getByRole('option', { name: '墨金', exact: true }).click()
  await expect(login).toHaveCSS('background-image', /linear-gradient/)
})

test('22 套主题的阅读卡、门户与行内链接使用对应的文字色阶', async ({ page }) => {
  await expect(page.locator('[data-palette-id]')).toHaveCount(22)
  const themes = await page.locator('[data-palette-id]').evaluateAll(cards => cards.map(card => (card as HTMLElement).dataset.paletteId!))
  const mismatches = await page.evaluate(ids => {
    const root = document.documentElement
    const sample = document.querySelector('#text-colors')!
    const portal = document.querySelector('#portal-demo')!
    const probe = document.body.appendChild(document.createElement('span'))
    const roles = [
      { role: 'primary', elements: [sample.querySelector('h3')!, portal.querySelector('.vx-portal-title')!] },
      { role: 'secondary', elements: [sample.querySelector('.vx-body')!, portal.querySelector('.vx-portal-lead')!] },
      { role: 'tertiary', elements: [sample.querySelector('.vx-meta')!, portal.querySelector('.vx-portal-quick-caption')!] },
      { role: 'link', elements: [sample.querySelector('a')!] },
    ]
    const failures: string[] = []
    for (const id of ids) {
      root.dataset.palette = id
      for (const mode of ['light', 'dark']) {
        root.dataset.theme = mode
        for (const { role, elements } of roles) {
          probe.style.color = 'var(--vx-text-' + role + ')'
          const expected = getComputedStyle(probe).color
          if (elements.some(el => getComputedStyle(el).color !== expected)) failures.push(id + '/' + mode + '/' + role)
        }
      }
    }
    probe.remove()
    return failures
  }, themes)
  expect(mismatches).toEqual([])
  const link = page.getByRole('link', { name: '打开明细查询', exact: true })
  await expect(link).toHaveCSS('text-decoration-line', 'underline')
  await link.focus()
  await link.press('Enter')
  await expect(page).toHaveURL(/#report$/)
})

test('可操作的导览跳过文字与正文链接一致，支持键盘退出', async ({ page }) => {
  const browse = page.getByTestId('browser-demo')
  await browse.getByRole('button', { name: '开始浏览导览' }).click()
  const skip = page.getByRole('button', { name: '跳过导览' })
  const anchor = page.locator('#text-colors a')
  await expect(skip).toHaveCSS('color', await anchor.evaluate(el => getComputedStyle(el).color))
  await expect(skip).toHaveCSS('text-decoration-line', 'underline')
  await skip.focus()
  await skip.press('Enter')
  await expect(skip).toHaveCount(0)
})

test('批量操作使用完整已选范围，可导出、移动、归档和撤销', async ({ page }) => {
  const demo = page.getByTestId('browser-demo')
  await demo.getByRole('checkbox', { name: '选择本周运营回顾' }).check()
  await demo.getByRole('checkbox', { name: '选择内容发布检查表' }).check()
  await demo.getByRole('combobox', { name: '内容类型' }).click()
  await page.getByRole('option', { name: '报告', exact: true }).click()
  const actions = demo.getByRole('toolbar', { name: '批量操作' })
  await expect(actions).toContainText('1 项在筛选外')
  await actions.getByRole('button', { name: '移动到' }).click()
  await page.getByRole('menuitem', { name: '团队共享' }).click()
  const rows = await exported(page, () => actions.getByRole('button', { name: '导出' }).click())
  expect(rows.map((row: { id: string; folder: string }) => [row.id, row.folder])).toEqual([['1', '团队共享'], ['2', '团队共享']])
  await actions.getByRole('button', { name: '归档' }).click()
  await expect(demo.locator('#browse-batch-receipt')).toHaveText('已归档 2 项。')
  await expect(demo.locator('#browse-batch-receipt')).toBeFocused()
  await expect(demo.getByText('已归档', { exact: true })).toHaveCount(1)
  await demo.getByRole('button', { name: '撤销归档' }).click()
  await expect(demo.getByText('已归档', { exact: true })).toHaveCount(0)
})

test('各主题的局部色卡和整页主按钮在两种明暗下使用同一组外观', async ({ page }) => {
  await expect(page.locator('[data-palette-id]')).toHaveCount(22)
  await page.addStyleTag({ content: '* { transition: none !important; }' })
  const mismatches = await page.evaluate(() => {
    const root = document.documentElement
    const login = document.querySelector('#portal .vx-btn--primary')!
    const differences: string[] = []
    for (const mode of ['light', 'dark']) {
      root.dataset.theme = mode
      for (const card of document.querySelectorAll<HTMLElement>('[data-palette-id]')) {
        root.dataset.palette = card.dataset.paletteId
        for (const key of ['background-color', 'background-image', 'color', 'box-shadow']) {
          if (getComputedStyle(login).getPropertyValue(key) !== getComputedStyle(card).getPropertyValue(key)) {
            differences.push(`${mode} ${root.dataset.palette} ${key}`)
          }
        }
      }
    }
    return differences
  })
  expect(mismatches).toEqual([])
})

test('轻微回读立即停止跟随，返回入口按实际行高显示', async ({ page }) => {
  const demo = page.getByTestId('session-workspace')
  await demo.getByRole('button', { name: '关闭示例页面' }).click()
  const pane = demo.getByRole('region', { name: '对话记录' })
  const input = demo.getByRole('textbox', { name: '示例对话输入' })
  const jump = demo.getByRole('button', { name: '跳至最新' })
  await page.evaluate(() => { document.documentElement.style.fontSize = '24px' })
  await input.fill(Array.from({ length: 40 }, (_, i) => '核对记录 ' + i).join('\n'))
  await input.press('Enter')
  await expect(pane.getByText('确认后保存方案，再查看本次变更的处理记录。')).toBeAttached()
  const scrollToGap = (lines: number) => pane.evaluate(async (el, lines) => {
    const scrolled = new Promise(resolve => el.addEventListener('scroll', resolve, { once: true }))
    el.scrollTop = el.scrollHeight - el.clientHeight - lines * parseFloat(getComputedStyle(el).lineHeight)
    await scrolled
    return el.scrollTop
  }, lines)
  const top = await scrollToGap(0.5)
  await expect(jump).toHaveCount(0)
  await demo.getByRole('button', { name: '资料核对', exact: true }).click()
  await demo.getByRole('button', { name: '方案讨论', exact: true }).click()
  await expect.poll(() => pane.evaluate(el => el.scrollTop)).toBe(top)
  // Additional content grows while the reader stays still.
  const append = () => pane.locator('.vx-msg--ai').evaluate(el => {
    const p = document.createElement('p')
    p.innerText = '新增记录\n'.repeat(5)
    el.append(p)
  })
  await append()
  await expect(jump).toBeVisible()
  expect(await pane.evaluate(el => el.scrollTop)).toBe(top)
  await scrollToGap(2)
  await expect(jump).toHaveCount(0)
  await scrollToGap(0.5)
  await append()
  await expect.poll(() => pane.evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop)).toBeLessThan(2)
})

test('短视口中的长选择列表保留搜索框，末项可选', async ({ page }) => {
  await page.setViewportSize({width: 850, height: 290})
  const trigger = page.getByRole('combobox', {name: '配色主题', exact: true})
  await trigger.click()
  const popup = page.locator('.vx-select-popup')
  const search = popup.getByRole('combobox')
  const last = popup.getByRole('option').last()
  const label = await last.innerText()
  await last.scrollIntoViewIfNeeded()
  await expect(search).toBeInViewport({ratio: 1})
  await expect(last).toBeInViewport({ratio: 1})
  expect(await popup.evaluate(el => el.getBoundingClientRect().height)).toBeLessThanOrEqual(264)
  await last.click()
  await expect(trigger).toHaveText(label)
})
