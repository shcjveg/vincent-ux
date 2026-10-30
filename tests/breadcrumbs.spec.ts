import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async({page})=>{await page.goto('/showcase/');await expect(page.getByTestId('breadcrumb-examples')).toBeVisible()})

test('面包屑默认可见并直接承担唯一页头，当前页不提供重复动作',async({page})=>{
 const demo=page.getByTestId('breadcrumb-examples'),path=demo.getByRole('navigation',{name:'页面路径'})
 await expect(path).toBeVisible();await expect(demo.locator('.vx-pagehead h2')).toHaveCount(1)
 await expect(path.getByRole('heading',{name:'历史已办',level:2})).toHaveAttribute('aria-current','page')
 await expect(path.getByRole('button')).toHaveCount(1);await expect(path.getByRole('button',{name:'资料待办',exact:true})).toBeVisible()
 await expect(path.locator('.vx-breadcrumb-separator')).toHaveAttribute('aria-hidden','true')
 await expect(demo.locator('.vx-pagehead .vx-count')).toHaveCount(0)
})

test('键盘通过一级标题返回原范围，再进入历史保留共同条件与焦点',async({page})=>{
 const demo=page.getByTestId('breadcrumb-examples'),scope=demo.getByRole('combobox',{name:'资料范围',exact:true})
 await scope.click();await page.getByRole('option',{name:'当前项目',exact:true}).click()
 await demo.getByRole('button',{name:'资料待办',exact:true}).focus();await page.keyboard.press('Enter')
 await expect(demo.getByRole('heading',{name:'资料待办',level:2})).toBeVisible();await expect(demo.locator('.vx-breadcrumbs')).toHaveCount(0)
 const history=demo.getByRole('button',{name:'历史已办',exact:true});await expect(history).toBeFocused();await expect(scope).toHaveText('当前项目')
 await history.press('Enter');await expect(demo.getByRole('button',{name:'资料待办',exact:true})).toBeFocused();await expect(scope).toHaveText('当前项目')
 await expect(demo.getByRole('button',{name:'交给 AI 继续',exact:true})).toBeDisabled();await expect(demo.getByRole('button',{name:'进入对话',exact:true})).toBeEnabled()
})

test('无历史记录只保留路径与空态，不出现筛选或零计数',async({page})=>{
 const demo=page.getByTestId('breadcrumb-examples')
 await demo.getByText('体验历史空状态',{exact:true}).click();await demo.getByRole('checkbox',{name:'显示历史记录'}).uncheck()
 await expect(demo.getByRole('navigation',{name:'页面路径'})).toBeVisible();await expect(demo.getByText('还没有处理记录',{exact:true})).toBeVisible()
 await expect(demo.getByRole('combobox')).toHaveCount(0);await expect(demo.locator('.vx-task-card')).toHaveCount(0);await expect(demo.locator('.vx-count,.vx-results-head')).toHaveCount(0)
})

for(const theme of ['light','dark'])test(`${theme} 面包屑在桌面与窄屏完整可读且无障碍`,async({page})=>{
 await page.evaluate(t => { document.documentElement.dataset.theme = t }, theme);const demo=page.getByTestId('breadcrumb-examples')
 for(const width of[1440,390,320]){await page.setViewportSize({width,height:1000});const head=demo.locator('.vx-pagehead');expect(await head.evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);await expect(demo.getByRole('heading',{name:'历史已办',level:2})).toBeVisible()}
 expect((await new AxeBuilder({page}).include('#breadcrumbs').analyze()).violations).toEqual([])
})
