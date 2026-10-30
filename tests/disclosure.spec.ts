import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async({page})=>{await page.goto('/showcase/');await expect(page.getByTestId('disclosure-examples')).toBeVisible()})

test('分组摘要展开后隐藏，关闭保留字段状态，数量与箭头只表达一次',async({page})=>{
 const group=page.getByTestId('group-disclosure'),head=group.locator('.vx-fold-head')
 await expect(group.locator('.vx-fold-description')).toHaveText('核对资料来源；检查发布范围')
 await head.focus();await head.press('Enter')
 await expect(head).toHaveAttribute('aria-expanded','true');await expect(head).toBeFocused()
 await expect(group.locator('.vx-fold-description')).toHaveCount(0)
 await expect(group.locator('.vx-count')).toHaveText('2 条')
 const toggle=group.getByRole('switch',{name:'来源检查',includeHidden:true});await toggle.uncheck()
 await head.press('Space');await expect(toggle).toBeHidden();await expect(head).toHaveAttribute('aria-expanded','false')
 await head.press('Tab');await expect(toggle).not.toBeFocused()
 await head.click();await expect(toggle).not.toBeChecked()
 const history=page.getByTestId('history-disclosure'),pending=history.getByRole('button',{name:/待核对资料/}),records=history.getByRole('button',{name:/处理记录/})
 await expect(pending).toHaveAttribute('aria-expanded','true');await records.click();await expect(pending).toHaveAttribute('aria-expanded','true')
 await expect(pending.locator('.vx-attention-count')).toHaveCount(1);await expect(pending.locator('.vx-fold-act .vx-count')).toHaveCount(0)
})

test('对象详情保留身份说明，编辑区明确保存与放弃策略并恢复焦点',async({page})=>{
 const detail=page.getByTestId('detail-disclosure'),row=detail.locator('.vx-fold--row')
 await row.getByRole('button').click();await expect(row.locator('.vx-fold-description')).toHaveText('渠道资料 · 2 份待核对')
 const add=detail.getByRole('button',{name:/补充来源链接/});await add.click()
 const input=detail.getByRole('textbox',{name:'来源链接'});await input.fill('invalid');await expect(detail.getByRole('button',{name:'保存链接',exact:true})).toBeDisabled();await input.fill('https://example.com/first')
 await detail.getByRole('button',{name:'保存链接',exact:true}).click()
 const edit=detail.getByRole('button',{name:/编辑来源链接/});await expect(edit).toBeFocused();await expect(input).toBeHidden()
 await edit.click();await expect(input).toHaveValue('https://example.com/first');await input.fill('https://example.com/unsaved');await edit.click();await edit.click();await expect(input).toHaveValue('https://example.com/first')
})

test('行内步骤与执行过程使用各自语义，进行中保持展开且完成后可切换',async({page})=>{
 const inline=page.getByTestId('inline-disclosure'),trigger=inline.getByRole('button',{name:'查看连接步骤',exact:true})
 await trigger.click();await expect(trigger).toHaveAttribute('aria-expanded','true');const id=await trigger.getAttribute('aria-controls');await expect(page.locator(`[id="${id}"]`)).toBeVisible()
 await trigger.press('Space');await expect(trigger).toHaveAttribute('aria-expanded','false')
 const process=page.getByTestId('steps-disclosure'),head=process.locator('.vx-steps-toggle'),steps=process.locator('.vx-steps')
 await expect(head.locator('.vx-msg-block-title')).toHaveCSS('margin-bottom','0px')
 await expect(steps).toBeHidden();await process.getByRole('button',{name:'开始执行示例'}).click();await expect(steps).toBeVisible();await expect(head).toHaveAttribute('aria-expanded','true');await head.click();await expect(steps).toBeVisible()
 await process.getByRole('button',{name:'完成执行示例'}).click();await expect(steps).toBeVisible();await expect(head).toContainText('2/2');await head.click();await expect(steps).toBeHidden();await process.getByRole('button',{name:'开始执行示例'}).click();await expect(steps).toBeVisible();await process.getByRole('button',{name:'完成执行示例'}).click();await expect(steps).toBeHidden()
})

for(const theme of ['light','dark'])test(`${theme} 原型组件组合在窄屏完整可读且无障碍`,async({page})=>{
 await page.evaluate(t => { document.documentElement.dataset.theme = t }, theme)
 for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});const demo=page.getByTestId('disclosure-examples');expect(await demo.evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);const head=page.getByTestId('group-disclosure').locator('.vx-fold-head');await head.click();await head.click();const columns=await page.getByTestId('organisms-examples').locator('.vx-metrics').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);expect(columns).toBe(width===320?1:width===390?2:4)}
 const result=await new AxeBuilder({page}).include('#disclosure').include('#controls-demo').include('#organisms-demo').analyze();expect(result.violations).toEqual([])
 expect(await page.locator('#organisms .vx-decision-actions').count()).toBe(0)
 await expect(page.getByTestId('organisms-examples').getByRole('button',{name:'处理件数说明'})).toBeVisible()
})
