import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async({page})=>{await page.goto('/showcase/');await expect(page.getByTestId('session-workspace')).toBeVisible()})

test('会话各自恢复页面、页签、草稿、搜索和滚动，隐藏页不进入键盘路径',async({page})=>{
 const demo=page.getByTestId('session-workspace'),tabs=demo.getByRole('tablist',{name:'会话页面'}),visible=demo.locator('.vx-render-body:visible')
 await demo.getByRole('textbox',{name:'工作备注',exact:true}).fill('方案 A 的未提交输入')
 await tabs.getByRole('tab',{name:'引用资料',exact:true}).click()
 await demo.getByRole('searchbox',{name:'筛选示例资料'}).fill('资料')
 await visible.evaluate(e=>e.scrollTop=180);const scroll=await visible.evaluate(e=>e.scrollTop);expect(scroll).toBeGreaterThan(100)
 await demo.getByRole('button',{name:'关闭示例页面',exact:true}).click();await expect(demo.locator('.vx-render')).toBeHidden()
 await expect(demo.getByRole('tab')).toHaveCount(0)
 await demo.getByRole('textbox',{name:'示例对话输入'}).fill('继续讨论 A')
 await demo.getByRole('button',{name:'恢复示例页面',exact:true}).click();await expect(visible).toBeVisible();expect(await visible.evaluate(e=>e.scrollTop)).toBe(scroll)
 await tabs.getByRole('tab',{name:'方案草稿',exact:true}).click();await expect(demo.getByRole('textbox',{name:'工作备注'})).toHaveValue('方案 A 的未提交输入')
 await demo.getByRole('button',{name:'资料核对',exact:true}).click();await expect(demo.getByRole('textbox',{name:'工作备注'})).toHaveValue('');await demo.getByRole('textbox',{name:'工作备注'}).fill('方案 B 的输入')
 await demo.getByRole('button',{name:'关闭示例页面',exact:true}).click();await demo.getByRole('textbox',{name:'示例对话输入'}).fill('继续讨论 B')
 await demo.getByRole('button',{name:'方案讨论',exact:true}).click();await expect(demo.getByRole('textbox',{name:'工作备注'})).toHaveValue('方案 A 的未提交输入');await expect(demo.getByRole('textbox',{name:'示例对话输入'})).toHaveValue('继续讨论 A')
 await demo.getByRole('button',{name:'资料核对',exact:true}).click();await expect(demo.locator('.vx-render')).toBeHidden();await expect(demo.getByRole('textbox',{name:'示例对话输入'})).toHaveValue('继续讨论 B')
 await demo.getByRole('button',{name:'收起示例对话',exact:true}).click();await expect(demo.getByRole('textbox',{name:'工作备注'})).toHaveValue('方案 B 的输入');await expect(tabs.getByRole('tab',{selected:true})).toBeFocused()
})

for(const width of [1440,390,320])test(`${width}px 工作区关闭、导航恢复与空状态时间布局`,async({page})=>{
 await page.setViewportSize({width,height:900});const demo=page.getByTestId('session-workspace')
 if(width===1440){await demo.getByRole('button',{name:'收起示例导航',exact:true}).click();const centers=await demo.locator('.vx-nav-item > svg').evaluateAll(xs=>xs.map(e=>{const r=e.getBoundingClientRect();return r.x+r.width/2}));expect(Math.max(...centers)-Math.min(...centers)).toBeLessThan(1);await expect(demo.locator('.vx-nav-account-more')).toBeHidden();await demo.getByRole('button',{name:'示例用户菜单'}).click();await page.getByRole('menuitem',{name:'展开示例导航',exact:true}).click()}
 await demo.getByRole('button',{name:'关闭示例页面',exact:true}).click();await expect(demo.getByRole('textbox',{name:'示例对话输入'})).toBeVisible()
 expect(await demo.locator('.vx-chat').evaluate(e=>e.clientWidth)).toBeGreaterThan(width===1440?500:240)
 if(width<740){await demo.getByRole('button',{name:'展开示例导航',exact:true}).click();const nav=page.getByRole('dialog',{name:'示例导航'});await expect(nav.getByRole('button',{name:'收起示例导航'})).toBeFocused();await page.keyboard.press('Escape');await expect(nav).toBeHidden();await expect(demo.getByRole('button',{name:'展开示例导航',exact:true})).toBeFocused();await expect(demo.locator('.vx-render')).toBeHidden()}
 await demo.getByRole('button',{name:'恢复示例页面',exact:true}).click();await expect(demo.getByRole('textbox',{name:'工作备注'})).toBeVisible()
 const states=page.getByTestId('component-states'),empty=states.locator('.vx-empty-state')
 const typography=await empty.evaluateAll(xs=>xs.map(e=>{const s=getComputedStyle(e);return[s.fontSize,s.color,s.padding,s.alignItems]}));expect(typography).toHaveLength(2);expect(typography[0]).toEqual(typography[1]);await expect(empty.getByRole('button')).toHaveCount(0)
 await expect(states.locator('time')).toHaveCount(1);await expect(states.locator('time')).toHaveAttribute('datetime','2026-10-25T10:00:00+08:00')
 const alignment=await states.locator('.vx-data-time').evaluate(e=>{const r=e.getBoundingClientRect(),h=e.closest('header')!.getBoundingClientRect();return {right:h.right-r.right,left:r.left>=h.left}});expect(alignment.right).toBeCloseTo(20,0);expect(alignment.left).toBe(true)
 expect(await states.evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true)
 const action=states.getByRole('button',{name:'打开关联记录'});expect(await action.evaluate(e=>{const r=document.createRange();r.selectNodeContents(e);const t=r.getBoundingClientRect(),b=e.getBoundingClientRect();return t.width<=b.width&&t.height<=b.height})).toBe(true)
 const long=states.getByRole('button',{name:'查看这项工作下一步需要准备的完整资料'});expect(await long.evaluate(e=>{const r=document.createRange();r.selectNodeContents(e);const t=r.getBoundingClientRect(),b=e.getBoundingClientRect();return t.top>=b.top&&t.bottom<=b.bottom})).toBe(true)
})

for(const theme of ['light','dark'])test(`${theme} 发送启禁状态与新增示例无障碍`,async({page})=>{
 await page.evaluate(t => { document.documentElement.dataset.theme = t }, theme);const demo=page.getByTestId('session-workspace');await demo.getByRole('button',{name:'关闭示例页面',exact:true}).click();const send=demo.getByRole('button',{name:'发送示例消息'}),input=demo.getByRole('textbox',{name:'示例对话输入'})
 await expect(send).toBeDisabled();const colors=()=>send.evaluate(e=>({bg:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color}));const disabled=await colors();await send.hover({force:true});expect(await colors()).toEqual(disabled)
 await input.fill('继续当前任务');await expect(send).toBeEnabled();await expect.poll(async()=>JSON.stringify(await colors())).not.toBe(JSON.stringify(disabled));await input.press('Enter');await expect(demo.locator('.vx-msg--user')).toHaveText('继续当前任务');await expect(input).toHaveValue('');await expect(send).toBeDisabled()
 const a11y=await new AxeBuilder({page}).include('#session-workspace').include('#component-states').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(a11y.violations).toEqual([])
})
