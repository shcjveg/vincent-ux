import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/showcase/')
  await expect(page.getByTestId('session-workspace')).toBeVisible()
})

test('桌面里的窄模块各按自己的宽度重排，同一登录任务可完成', async ({ page }) => {
  const filters = page.locator('.vx-filter-panel').first()
  const portal = page.getByTestId('portal-demo')
  const grid = page.getByRole('form', { name: '表单示例' }).locator('.vx-grid')
  for (const el of [filters, grid, portal]) await el.evaluate(node => node.style.width = '320px')
  await expect(filters.locator('.vx-filterbar-row')).toHaveCSS('flex-direction', 'column')
  await expect(grid).toHaveCSS('grid-template-columns', '320px')
  const bounds = await portal.evaluate(el => {
    const panel = el.querySelector('.vx-portal-panel')!.getBoundingClientRect()
    const frame = el.getBoundingClientRect()
    return { centered: Math.abs(panel.left + panel.right - frame.left - frame.right) < 2, fits: el.scrollWidth <= el.clientWidth }
  })
  expect(bounds).toEqual({ centered: true, fits: true })
  await portal.getByRole('button', { name: '登录', exact: true }).click()
  await expect(portal.getByRole('textbox', { name: '账号' })).toBeFocused()
  await portal.getByRole('textbox', { name: '账号' }).fill('brand-a')
  await portal.getByLabel('密码', { exact: true }).fill('demo')
  await portal.getByRole('button', { name: '登录', exact: true }).press('Enter')
  await expect(portal.getByRole('heading', { name: '内容看板' })).toBeFocused()
  await filters.evaluate(el => el.style.width = '900px')
  await expect(filters.locator('.vx-filterbar-row')).toHaveCSS('flex-direction', 'row')
})

test('工作区在宽屏侧栏中切换导航形态并保留草稿', async ({ page }) => {
  const work = page.getByTestId('session-workspace')
  const draft = work.getByRole('textbox', { name: '工作备注' })
  await draft.fill('保留这份工作备注')
  await work.evaluate(el => el.style.width = '360px')
  const open = work.getByRole('button', { name: '展开示例导航', exact: true })
  await open.click()
  const nav = page.getByRole('dialog', { name: '示例导航' })
  await expect(nav).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(open).toBeFocused()
  await work.evaluate(el => el.style.removeProperty('width'))
  await expect(work.getByRole('button', { name: '收起示例导航', exact: true })).toBeVisible()
  await expect(draft).toHaveValue('保留这份工作备注')
})

test('偏好字号翻倍后正文、标题与控件同步增长；减少动态效果时无需等待入场', async ({ page }) => {
  const sample = page.locator('#text-colors')
  const button = page.getByRole('form', { name: '表单示例' }).getByRole('button', { name: '保存设置', exact: true })
  const height = (await button.boundingBox())!.height
  await page.evaluate(() => document.documentElement.style.fontSize = '32px')
  await expect(sample.locator('.vx-body').first()).toHaveCSS('font-size', '26px')
  await expect(sample.locator('.vx-meta').first()).toHaveCSS('font-size', '24px')
  await expect(button).toHaveCSS('font-size', '26px')
  expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(height * 2)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.vx-portal .vx-rise').last()).toHaveCSS('animation-delay', '0s')
})

test('查询的重试范围独立于后来编辑的条件，空结果保留已应用范围', async ({ page }) => {
  const report = page.getByRole('region', { name: '明细查询' })
  await page.route('**/report-data.json*', route => route.fulfill({ status: 503 }), { times: 1 })
  await report.getByRole('button', { name: '查询', exact: true }).click()
  await expect(report.getByRole('alert')).toContainText('华东')
  await report.getByRole('radio', { name: '华南' }).check()
  await report.getByRole('button', { name: '重试查询' }).click()
  await expect(report.getByRole('heading')).toHaveText('华东明细')
  await page.route('**/report-data.json*', route => route.fulfill({ json: [] }), { times: 1 })
  await report.getByRole('button', { name: '查询', exact: true }).click()
  await expect(report.getByText('当前范围没有明细')).toBeVisible()
  await expect(report.getByRole('heading')).toHaveText('华南明细')
})

test('清除已选项时，原记录已离开界面则把焦点还给结果区', async ({ page }) => {
  const browse = page.getByTestId('browser-demo')
  const row = browse.getByRole('checkbox', { name: '选择本周运营回顾' })
  await row.focus()
  await row.press('Space')
  await browse.getByRole('searchbox').fill('检查表')
  const toolbar = browse.getByRole('toolbar', { name: '批量操作' })
  await expect(toolbar).toContainText('1 项在筛选外')
  await toolbar.getByRole('button', { name: '取消选择' }).press('Enter')
  await expect(browse.getByRole('group', { name: '浏览结果' })).toBeFocused()
})

test.describe('触控操作', () => {
  test.use({ hasTouch: true })
  test('筛选、页签、卡片与展示页操作使用同一触控命中区下限', async ({ page }) => {
    const browse = page.getByTestId('browser-demo')
    const controls = [browse.getByRole('button', { name: '下一页' }), browse.getByRole('button', { name: '列表', exact: true }),
      page.getByRole('form', { name: '表单示例' }).getByRole('button', { name: '保存设置', exact: true }),
      page.getByRole('button', { name: '关闭明细', exact: true }).first(), page.locator('.sc-palette .vx-btn').first(),
      page.locator('.vx-section-action:visible').first(), page.locator('.vx-section-chat:visible').first(), page.locator('.vx-fold-head:visible').first()]
    for (const control of controls) {
      const bounds = await control.boundingBox()
      expect(bounds!.height).toBeGreaterThanOrEqual(44)
      expect(bounds!.width).toBeGreaterThanOrEqual(44)
    }
  })
})

test('账号菜单的退出和重新进入都给出结果及键盘落点', async ({ page }) => {
  const section = page.locator('#interaction-demo')
  const menu = section.getByRole('button', { name: /当前用户/ })
  await menu.click()
  await page.getByRole('menuitem', { name: '退出登录' }).click()
  const enter = section.getByRole('button', { name: '重新进入示例账号' })
  await expect(enter).toBeFocused()
  await enter.press('Enter')
  await expect(menu).toBeFocused()
})

test('320px 宽和两倍字号同时生效，任务状态与长操作完整换行', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.evaluate(() => document.documentElement.style.fontSize = '32px')
  await expect(page.locator('#text-colors .vx-body').first()).toHaveCSS('font-size', '26px')
  const card = page.locator('#breadcrumbs .vx-task-card').first()
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => document.documentElement.dataset.theme = value, theme)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
    const bounds = await card.evaluate(el => {
      const row = el.querySelector('.vx-task-status-main')!.getBoundingClientRect()
      const time = el.querySelector('time')!.getBoundingClientRect()
      const actions = Array.from(el.querySelectorAll<HTMLButtonElement>('.vx-task-action'))
      const frame = el.getBoundingClientRect()
      return {
        timeFits: time.top >= row.bottom && time.right <= frame.right,
        actionsFit: actions.length > 0 && actions.every(button => button.scrollWidth <= button.clientWidth + 1 && button.getBoundingClientRect().right <= frame.right),
      }
    })
    expect(bounds).toEqual({ timeFits: true, actionsFit: true })
  }
})
