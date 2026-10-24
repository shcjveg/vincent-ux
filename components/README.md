<!-- vincent-ux v1.3.0 · components/README.md -->
# 组件选用指南

按「要做的事」分八组，一个组件只出现在一组里。每组先说什么情况用哪个，再说常见的误用。长什么样看 `showcase/index.html`；多个组件怎么配合看 `patterns/`；颜色语义看 `principles/visual.md`。带「React」的有交互组件，其余直接用类名。

## 1. 文字、数字与标识

| 情况 | 用 |
|---|---|
| 标题、正文、辅助说明 | `.vx-title` / `.vx-body` / `.vx-meta`（只改字色时 `.vx-text-2` / `.vx-text-3`），区域内通常三档 |
| 一句话里要你看的钱，或亏损、阻断 | `.vx-text-accent` / `.vx-text-critical` |
| 只给读屏的文字 | `.vx-sr-only` |
| 金额、百分比、件数 | `.vx-num`；金额用 `.vx-money`（负数 `--neg`，要你看的钱 `--accent`） |
| 对象的识别图（商品、渠道、人） | `.vx-thumb`（`--sm` / `--lg`）、`.vx-avatar` |
| 表达一个功能 | `Icon`（React）/ `.vx-icon`，按 `icons/icons.json` 的含义选 |

误用：用字号拉开层级（先用字色和字重）；用装饰图标填空。

## 2. 触发操作

| 情况 | 用 |
|---|---|
| 这一块推荐的下一步 | `Button variant="primary"` / `.vx-btn--primary`，一个任务区域最多一个 |
| 其他可选的动作 | `.vx-btn`（次按钮） |
| 轻的动作：查看、再问问、收起 | `.vx-btn--ghost` |
| 不可撤回的危险动作 | `Button variant="danger"` / `.vx-btn--danger`，按后果确认 |
| 交给 AI 问一问 / 起草一份 | `AgentAction kind="ask | draft"`（React），见 `patterns/delegate.md` |
| 外壳和工具栏里的纯图标动作 | `.vx-icon-btn`，必须带 `aria-label` |

误用：用强调色做按钮；用箭头表示「去对话」（箭头只表示去另一页）。

## 3. 输入与选择

| 情况 | 用 |
|---|---|
| 填文字 | `.vx-input` / `.vx-textarea`，外面套 `Field`（React，关联标签、说明、错误）或 `.vx-field` |
| 从有限选项中选一个 | `Select`（React）；纯 HTML 用 `.vx-select` |
| 两到四个互斥视图之间切换 | `Segmented`（React）/ `.vx-seg` |
| 立即生效的开关 | `Switch`（React）/ `.vx-switch`；保存型表单里的开关随表单提交 |
| 行尾切换一个属性，状态要写出来（置顶 / 已置顶） | `.vx-toggle` |
| 表单里的勾选 | `Checkbox`（React，含半选）/ `.vx-check` |
| 少量互斥选项 | `RadioGroup`（React，原生 radio） |
| 在少量对象之间切换，或已应用的筛选条件 | `button.vx-chip[aria-pressed]`，放在 `.vx-filterbar` |
| 引导或设置里的一次性选择，每项要一句说明 | `.vx-choice`（大卡，单选）、`--row`（行式清单）、`--tile`（带标识的一组对象，可多选；还不能用的照常列出并 `disabled`，说明写原因） |
| 传文件 | `.vx-dropzone` |

误用：页内频繁切换用选择卡（用分段）；把大量条件同时铺开（常用条件前置，复杂条件按需展开）。

## 4. 状态与反馈

| 情况 | 用 |
|---|---|
| 一个对象当前处于什么状态 | `.vx-tag`；等你动手的那一个状态 `--accent`，阻断、亏损、超时 `--critical`，其余一律中性 |
| 这件事是谁做的 | `.vx-by`（自动 / AI 助理） |
| 时限很近 | 需要突出时用 `.vx-due`（墨色加粗）；分组已表达紧急时保持普通文字 |
| 入口上提醒有急事 | `.vx-dot`；待办总入口的数字 `.vx-badge`；不急的总数 `.vx-count`。规则见 `patterns/todo-and-badge.md` |
| 全页只有一句话的提醒 | `.vx-callout` |
| 没有内容 | `.vx-empty`：说为什么空，给一个动作 |
| 正在加载 | `.vx-skeleton`（占位）、`.vx-spinner`（按钮内） |
| 刚完成一个动作 | `.vx-toast`，几秒后消失 |
| 从别处跳过来，指出落点 | `.vx-arrived` |

误用：一组对象各有状态时铺一大块提示条（用卡片加列表行，避免状态与正文重复）；在卡片或列表行里放红点。

## 5. 分组与收纳

| 情况 | 用 |
|---|---|
| 一块相对独立的内容 | `.vx-card` 分头／正文，直接放内容用 `.vx-card--padded`；卡片里再分一段用 `.vx-card-section`，嵌一块淡底用 `.vx-nested` |
| 一组内容不需要卡片包裹 | `.vx-section-title` 加留白 |
| 一串同类对象 | `.vx-rows` > `.vx-row`；长列表要分隔时 `--ruled` |
| 要点或步骤说明 | `.vx-list` |
| 次要信息（已做完的、依据、明细） | `Fold`（React）/ `.vx-fold`，默认收起；有集合数量时带计数，末尾只留箭头 |
| 列表里每行能展开看详情 | `Fold variant="row" summary="标题" description="必要说明"` |
| 自己做的展开按钮要一个朝向提示 | `.vx-chev`，展开时自动翻转 |
| 少量「名称：值」 | `.vx-kv`（窄处 `--stack`） |

误用：用线和框分组（先用面的明度差和留白）；在卡片里再套卡片。

## 6. 数据展示

| 情况 | 用 |
|---|---|
| 一个关键数字 | `.vx-stat`，多个并排放 `.vx-stats` 或网格；能点进去看明细时用 `button.vx-stat` |
| 多行多列、要比较或排序 | `.vx-table` |
| 一个量占总量多少 | `.vx-bar`（中性 `--neutral`，亏损 `--critical`） |
| 一段时间的走势 | `.vx-spark`，只把要你看的那段标出来 |
| 分页 | `Pagination`（React）/ `.vx-pager` |

误用：单序列图表用多种颜色；为了好看把表格做成卡片网格。

## 7. 人与 AI 协作

| 情况 | 用 |
|---|---|
| 要人处理的一件事，在清单里 | `.vx-todo`，整张清单放 `.vx-todos`，按急缓分组复用 `Fold`，当前组加 `.vx-todo-group`；旧 `.vx-todo-group-head` 保留 |
| 要人在几个选项里拍板 | `DecisionCard`（React），见 `patterns/decision.md` |
| 人要按顺序走完的几步（每步都要人做） | `.vx-flow`，当前步放唯一的主按钮 |
| AI 或自动执行的过程 | `.vx-steps` |
| 和 AI 对话 | `.vx-chat` 及其消息、输入区、建议 |
| 带人走一遍产品 | `Guide`（React），含说明卡、挖空蒙层和目标高亮，见 `patterns/guide.md` |

误用：人要做的步骤用 `.vx-steps`（那是给机器执行过程的）；把一件要拍板的事写成普通待办行而不给选项。

## 8. 浮层

| 情况 | 用 |
|---|---|
| 下拉选项、补充说明 | `.vx-popup`、`Tip`（React） |
| 不离开当前页看一个对象的详情 | `Dialog variant="drawer"`（React）/ `.vx-drawer` |
| 必须先答复才能继续 | `Dialog`（React）/ `.vx-dialog` |

误用：能在页面里展开说清的事弹对话框；浮层以外的地方用玻璃质感。

位置遵循[容器稳定原则](../principles/visual.md#容器位置不随-item-数量跳变)：弹窗顶部距离视口为 `clamp(24px, 12dvh, 96px)`，内容过长在正文区滚动；下拉默认向下、对齐触发器起始边，视口不足时允许避让。

## 内容浏览

| 情况 | 用 |
|---|---|
| 按关键词查找 | `SearchField`：名称、清空、Esc、Enter 提交，保留中文输入组合行为 |
| 组合条件与撤销条件 | `FilterBar`：容纳 `Select` 等控件，已选条件可逐个移除或清除全部 |
| 一串内容或卡片网格 | `Collection layout="list | grid"`：共用结果、总数、加载、空、失败与重试 |
| 列表／网格切换 | `Segmented`，保持排序、筛选和选择 |
| 多页结果 | `Pagination`：从 1 开始，边界禁用，最多显示 5 个邻近页码 |
| 长表格在有限宽度内逐列比较 | `TableScroll`：命名滚动区域，仅溢出时进入 Tab 顺序；通过 `minWidth` 按列数保留可读宽度 |
| 同一工作区的多个内容面板 | `Tabs`：方向键切换，Delete 或列表旁的按钮关闭当前页签 |

组合规则见 [内容浏览与筛选](../patterns/browse.md)，可运行示例在 `showcase/react.tsx`。网格用于封面或摘要有意义的内容；需要逐列比较时用表格。列表与网格都保留 `ul/li` 语义，只有需要单元格键盘导航时才引入 ARIA grid。

## React 接入约定

从 `components/react/index.ts` 导入；完整类型就在各组件源文件，避免维护第二套接口表。基础 CSS 与页签样式都在组件层，使用整体外壳时再引入模板 CSS，或直接引入根目录 `styles.css`。

```tsx
<Field label="名称" hint="用便于识别的短名称" error={error} required>
  {props => <input {...props} className="vx-input" name="name" value={name}
    onChange={event => setName(event.target.value)} />}
</Field>
<Button type="submit" loading={saving}>保存设置</Button>
<SearchField label="搜索内容" value={query} onChange={setQuery} />
```

- `Button` 默认 `type="button"`，提交表单明确写 `submit`。`loading` 会原生禁用，表单提交处理也应检查进行中的请求。
- `Select` 支持空值 `null`、禁用项、`name`、`required`、字段 id 和 ARIA 关联；需要可搜索的大量远程选项时，由产品另行组合搜索与结果，不把普通下拉当成万能选择器。
- `SearchField` 只控制输入；`onChange` 适合本地即时筛选，`onSearch` 适合 Enter 提交。网络防抖、竞态取消由产品负责。
- `Collection` 接收 `items/getKey/renderItem`；稳定 id 保持选择。它不擅自改变业务数据、排序和分页，卡片内部的查看和勾选用独立控件，避免嵌套按钮。
- `Dialog` 的 dialog / drawer 都是模态；`dismissible=false` 仅禁止点遮罩关闭，Esc 与关闭按钮仍可退出。入口会消失时提供 `finalFocus`。
- `Tabs` 的 `variant="workspace"` 让内容面板填满外壳，`actions` 放工作区操作，`indicator` 放入口提醒；操作位于 tablist 外，避免交互嵌套。
- `Tabs` 受控，`onClose` 由使用方移除条目；关闭当前页签后优先选择右邻，否则左邻。最后一页关闭后的空态由使用方处理。
- `Guide` 是实际页面上的非模态分步介绍；默认底部停靠，`placement="left"` 可优先居左，遮挡目标时说明卡避让。目标缺失时找备选，仍缺失则跳过；异步 `go()` 完成后定位，退出时恢复入口焦点。

纯 CSS 的 toast、table、dropzone 等属于外观基元，业务交互与语义仍由使用方接入；不要把静态展示误当成完整上传或通知组件。

布局间距统一按 [视觉原则的场景表](../principles/visual.md#布局与间距)：卡片内容不要裸放在 `.vx-card` 下；选择 `.vx-card--padded` 或 head/body 结构。纵向组用 `.vx-stack`（16px），独立区块用 `.vx-stack--lg`（24px），同组按钮用 `.vx-cluster`（8px）。

选择卡的选中态只保留淡底和细边界，图标与字重不随选中变化，省略 `.vx-choice-check`。单选或多选状态通过 `aria-pressed`，或原生 radio/checkbox 语义暴露；不要额外放一个对号重复提示。内容列表的批量选择保留真实复选框，避免把选择与打开详情混成一个动作。

行组件默认只用标题与说明两层；数量和操作沿用说明样式。`Fold` 优先传简短 `summary` 与 `description`，`side` 仅放正文未表达的必要信息。完整约束见 [组件内控制样式种类](../principles/visual.md#组件内控制样式种类)，避免把所有文字类、标签和强调方式同时装进一个组件。

卡内的一组指标用 `.vx-stats.vx-stats--inline`，保留指标层级而不重复嵌套承载面。整页选择按[页面组合](../patterns/page-composition.md)。

导览每次进入步骤时调用一次 `go()`；宿主因此重渲染或重建等价回调不会重复导航。切换步骤或改变目标/文案才重新定位。
