<!-- vincent-ux v1.4.1 · components/README.md -->
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
| 从有限选项中选一个 | `Select`（React，可搜索，无选中对号占位）；纯 HTML 用 `.vx-select` |
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
| 入口上提醒有急事 | `.vx-dot`，选中后仍保留；板块标题用 `AttentionTitle count`，结果层显示匹配数量。规则见 `patterns/todo-and-badge.md` |
| 全页只有一句话的提醒 | `.vx-callout` |
| 没有内容 | `EmptyState`：卡片与表格用默认 section，整页结果用 page；需要时给原因或有效动作 |
| 正在加载 | `.vx-skeleton`（占位）、`.vx-spinner`（按钮内） |
| 刚完成一个动作 | `.vx-toast`，几秒后消失 |
| 从别处跳过来，指出落点 | `.vx-arrived` |

误用：一组对象各有状态时铺一大块提示条（用卡片加列表行，避免状态与正文重复）；给普通内容、执行等待或待办入口列表逐行重复红点。具体处理卡片的左上角标遵循待办模式。

## 5. 分组与收纳

| 情况 | 用 |
|---|---|
| 一块相对独立的内容 | `.vx-card` 分头／正文，直接放内容用 `.vx-card--padded`；卡片里再分一段用 `.vx-card-section`，嵌一块淡底用 `.vx-nested` |
| 一组内容不需要卡片包裹 | `.vx-section-title` 加留白 |
| 一串同类对象 | `.vx-rows` > `.vx-row`；长列表要分隔时 `--ruled` |
| 要点或步骤说明 | `.vx-list` |
| 次要信息（已做完的、依据、明细） | `Fold`（React）/ `.vx-fold`；按实际用途设置摘要与默认状态，见[收起与展开](disclosure.md) |
| 列表里每行能展开看详情 | `Fold variant="row" summary="标题" description="必要说明"`，展开后保留对象身份 |
| 自己做的展开按钮要一个朝向提示 | `.vx-chev`，展开时自动翻转 |
| 少量「名称：值」 | `.vx-kv`（窄处 `--stack`） |

误用：用线和框分组（先用面的明度差和留白）；在卡片里再套卡片。

## 6. 数据展示

| 情况 | 用 |
|---|---|
| 一个关键数字 | `Metric`（标签、数值、可选比较、口径与来源）；CSS 使用 `.vx-stat`，多个并排放 `.vx-stats` 或网格；能点进去看明细时用 `button.vx-stat` |
| 多行多列、要比较或排序 | `.vx-table` 放进命名的 `TableScroll`，操作列保留完整按钮与输入宽度 |
| 有可靠来源的数据更新时间 | `SectionCard updatedAt` / `DataTime`，标题区右侧；统计期间与时限各留在自己的语义位置 |
| 一个量占总量多少 | `.vx-bar`（中性 `--neutral`，亏损 `--critical`） |
| 一段时间的走势 | `.vx-spark`，只把要你看的那段标出来 |
| 分页 | `Pagination`（React）/ `.vx-pager` |

误用：单序列图表用多种颜色；为了好看把表格做成卡片网格。

## 7. 人与 AI 协作

| 情况 | 用 |
|---|---|
| 导航到某件事的简短清单 | `.vx-todo` / `.vx-todos`；只作导航，不承载 AI 确认；实际处理使用 `TaskCard` |
| 处理待办实例并回看历史 | `TaskCard` + `TaskStatus`：三项轻量状态行、背景与媒体槽位、事实摘要、建议与自定义、交办／接管／对话；`pending` 取 `continue` 或 `takeover` 锁定提交中状态，`error` 保留失败反馈；状态与历史由应用维护，见 `patterns/task-workspace.md` |
| 单次引导中的选项决定 | `DecisionCard`：适合有独立结束反馈的引导；日常 AI 反馈默认使用 `TaskCard`，见 `patterns/decision.md` |
| 说明动作由谁执行 | `ActionBar`：自动 / AI / 人工及下一步说明；主动作、AI 调整和人工接管共用操作区 |
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
| 时间筛选与排序 | `DateFilter`：快捷侧栏、起止输入、连续月历、取消／应用，可选上一时段对比；`SortMenu`：方向图标与字段名称组成的单按钮，点击切换方向，筛选独立于排序 |
| 组合条件与撤销条件 | `FilterBar`：容纳 `Select` 等控件，已选条件可逐个移除或清除全部 |
| 一串内容或卡片网格 | `Collection layout="list | grid"`：共用结果、总数、加载、空、失败与重试 |
| 列表／网格切换 | `Segmented`，保持排序、筛选和选择 |
| 多页结果 | `Pagination`：从 1 开始，边界禁用，最多显示 5 个邻近页码 |
| 长表格在有限宽度内逐列比较 | `TableScroll`：命名滚动区域，仅溢出时进入 Tab 顺序；通过 `minWidth` 按列数保留可读宽度 |
| 同一工作区的多个内容面板 | `Tabs`：方向键切换，Delete 或悬停／聚焦时出现的行尾按钮关闭页签 |

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
- `Select` 支持空值 `null`、禁用项、`name`、`required`、字段 id 和 ARIA 关联；弹层内置本地搜索，匹配名称与提示，空结果可恢复；远程搜索的数据请求、分页和竞态由产品管理。
- `SearchField` 只控制输入；`onChange` 适合本地即时筛选，`onSearch` 适合 Enter 提交。网络防抖、竞态取消由产品负责。
- `Collection` 接收 `items/getKey/renderItem`；稳定 id 保持选择。它不擅自改变业务数据、排序和分页，卡片内部的查看和勾选用独立控件，避免嵌套按钮。
- `Dialog` 的 dialog / drawer / stage 都是模态；stage 用于实机内的全屏路线选择：与 Guide 共用蒙层，选项直接置于蒙层中，底部横向反差说明条承载标题、说明和动作，不加中央弹窗外壳；`dismissible=false` 仅禁止点遮罩关闭，Esc 与关闭按钮仍可退出。入口会消失时提供 `finalFocus`。
- `Tabs` 的 `variant="workspace"` 让内容面板填满外壳，`leading` 放移动导航入口，`actions` 放工作区操作，`indicator` 放入口提醒；操作位于 tablist 外，避免交互嵌套。
- 工作区页签按文案确定宽度，关闭区域贴近标题；未激活页签复用悬停的浅色底面，当前项使用卡片底面，不叠分隔线。关闭按钮保留独立命中区域，悬停不改变页签宽度；触屏始终显示关闭入口。
- `Tabs` 受控，`onClose` 由使用方移除条目；关闭当前页签后优先选择右邻，否则左邻。最后一页关闭后的空态由使用方处理。
- `Guide` 是实际页面上的非模态分步介绍；`variant="banner"` 提供横向底部说明并测量预留空间，`ready` 控制真实操作完成后前进，`onComplete` 与退出分开；默认底部停靠，`placement="left"` 可优先居左，遮挡目标时说明卡避让。目标缺失时找备选，仍缺失则跳过；异步 `go()` 完成后定位，退出时恢复入口焦点。

纯 CSS 的 toast、table、dropzone 等属于外观基元，业务交互与语义仍由使用方接入；不要把静态展示误当成完整上传或通知组件。

布局间距统一按 [视觉原则的场景表](../principles/visual.md#布局与间距)：卡片内容不要裸放在 `.vx-card` 下；选择 `.vx-card--padded` 或 head/body 结构。纵向组用 `.vx-stack`（16px），独立区块用 `.vx-stack--lg`（24px），同组按钮用 `.vx-cluster`（8px）。

独立选择卡可用 `aria-pressed` 暴露多选状态，以淡底和细边界区分选中，不额外叠加复选框或对号。需要同时提供打开详情与批量选择的内容列表，保留真实复选框来区分动作。选项多时按用户理解分组到页签，每屏保留少量选项；用语义图标辅助扫读。批量添加入口降为可选下拉，清空操作靠近已选数量。

行组件默认只用标题与说明两层；数量和操作沿用说明样式。`Fold` 的分组摘要、对象身份、编辑区、行内步骤与对话过程分别按[收起与展开规范](disclosure.md)接入；`side` 仅放正文未表达的非交互信息。完整约束见 [组件内控制样式种类](../principles/visual.md#组件内控制样式种类)，避免把所有文字类、标签和强调方式同时装进一个组件。

卡内的一组指标用 `.vx-stats.vx-stats--inline`，保留指标层级而不重复嵌套承载面。整页选择按[页面组合](../patterns/page-composition.md)。

导览每次进入步骤时调用一次 `go()`；宿主因此重渲染或重建等价回调不会重复导航。切换步骤或改变目标/文案才重新定位。

纯文字紧凑选择项可省略 `.vx-choice-mark`：名称在上、说明在下，完整换行。决定选择的名称不得为了固定行高截成省略号；平台标识类紧凑项才使用带标记的布局。

路径选择入口可加 `.vx-choice--route`：头部用 `.vx-choice-route-head` 对齐稳定的 A/B 标识（`.vx-choice-route-key`）与向前箭头（`.vx-choice-route-arrow`）。整卡可点，悬停与键盘焦点强化箭头，按下有轻微反馈；选中继续沿用单一底色与边界，不叠复选框。字母是选项标识，不自动意味着键盘快捷键。

补充说明使用 `TextTip`，标题本身以极细虚线下划线提示可展开；保留 `Tip` 供自定义触发器。标题支持悬停、键盘聚焦与点击展开；点击后保持阅读，再次点击、点击外部或 Esc 关闭，触屏可点按。内容应填写具体规则、比较对象、条件与产出，不能用空提示或泛泛的设计说明。

概览指标用 `.vx-metrics.vx-stats--inline`，需要更突出的主数值时加 `.vx-metrics--overview`；共同期间用 `.vx-section-period` 放在分区标题旁。指标标题本身使用 `DataTip` / `TextTip`，以虚线下划线和“指标名＋说明”的可访问名称呈现，不再追加信息图标；固定底注只用于当前异常或必要条件。

指标组合复用 `SectionHeader` 与 `Metric`：标题及期间选择器放在一起，区域操作靠另一端。`Select variant="inline"` 用于标题旁的轻量范围切换；数值独立一行，环比另占一行，比较方式在标题旁用内联选择器配置，可关闭比较；比例差用 Δ 与有符号百分数，完整差值口径进入信息提示。零基数或不可比时不伪造变化。`DataTip` 只解释简短口径与数据来源，默认不在每个指标底部重复说明。成本列表以项目名与金额对齐；只有影响判断的缺口／估算状态留在行内，详情由状态入口或信息提示提供。


对象摘要复用 `ObjectPreview`：首图、名称与一个必要摘要；悬停或聚焦显示只读预览，点击或 Enter 进入详情。预览通过 portal 避让滚动容器，不承担唯一操作入口；触屏可直接打开详情。完整字段、变体、来源链接与编辑行为由产品详情抽屉承载。

`MetricComparison` 的 direction 表示数值方向，sentiment 表示对当前任务有利／不利，不能机械地把上涨当作改善；成本下降可表示有利。变化箭头使用 2.6px 线宽；正负颜色使用 data-positive / data-negative，保留箭头或正负号，避免只靠颜色。difference 表示绝对比例差，以 Δ 与正负号替代重复方向箭头。

待办汇总使用 `ActionSummary`：每项提供 label、count、urgentCount 与 onSelect。类别仅在 urgentCount 大于零时显示一个红点，普通数量与箭头紧邻成组，零项禁用且无箭头；业务侧负责同一待办来源与筛选落点。`ObjectPreview` 仅承担自身内边距，摘要与后续内容的间距由父容器控制。

板块默认使用 `SectionCard`，标题、controls、chatAction 和 actions 通过 `SectionHeader` 对齐。chatAction 是标题左侧的对话图标；范围选择、必要期间或状态放在标题右侧，详情动作放右上角，用 `SectionAction` 的轻底色按钮且不带横向箭头；按钮文案由业务传入，不设固定的“查看详情”。一次性回应、过程说明与泛泛注释不作为副标题。流程中的确认、修改和接管仍靠近其作用对象。

卡片内部用 `.vx-section-columns` / `.vx-section-pane` 组织并列内容组，宽卡片两栏、窄卡片一栏，组间通过对齐和 24–32px 留白区分，不再添加嵌套卡片或装饰线。多对象摘要用 `.vx-section-summary-grid`；无关内容不要为了填满宽度拉开组内距离。

## 窄屏工作区

`WorkspaceOverlay` 将常驻内容切为模态面板：`active=false` 保留内联布局，`active=true` 时由 `open` 控制带遮罩的弹层。`variant="nav"` 用于左侧实色导航抽屉，默认 `panel` 用于对话等完整工作面。标题来自 `label`；关闭、初始焦点与焦点恢复由 `onOpenChange`、`initialFocus`、`finalFocus` 接入。底层使用 Base UI 的模态、键盘循环与 Esc 行为。

通过 `useViewportQuery` 跟随视口变化。桌面展开偏好与移动抽屉状态分开保存；跨断点关闭抽屉，导航后关闭覆盖层。对话草稿与会话状态放在宿主，跨布局切换和收起后继续保留。

导航分组标题使用 `.vx-nav-group-title`，左侧名称、右侧 `.vx-icon-btn` 管理或新建入口。空状态统一用 `.vx-nav-empty`：`text-muted` 比标题浅一档，保持 11px 辅助字号；该文字色只用于 `surface-shell` 或 `surface-card`，浅深主题均检查 4.5:1。


### 待办标记与用户菜单

`AttentionTitle count` 只供概览板块标题计数；`TaskCard attention` 为真实待处理实例显示左上角标。`SectionCard attention`、`DecisionCard attention` 保留给明确的处理终点或单次引导，不用于普通记录与报表。原始 `Attention corner` 适用于自定义处理卡片，父节点使用 `data-pending-card="true"`。列表入口没有角标，普通状态不使用红点。

`ActionMenu` 使用 Base UI Menu：触发器支持点击和键盘，方向键选项、Esc 关闭并恢复焦点、点击外部关闭，菜单位置避开视口边界。工作区用户卡片整块为触发器，展开态尾部显示三点，收起态只留头像一个热区；辅助工具收在这里，顶部页签条不重复用户资料。手机菜单在导航抽屉内可操作。

筛选式选择器使用 `Select variant="filter"`，无边框但保留下拉箭头；通过 `allValue` 指定全量值，触发器在该状态显示 `label`，不拼接“全部”。普通表单保持默认外框。

筛选选择器的全量项通过 `allValue` 标识，组件将其固定为第一项并统一显示“全部”，不写“全部类型”等复合名称。筛选默认使用全量值，已有页面上下文可保留；全量状态的触发器显示字段名。

`Breadcrumbs`：`items` 提供路径标签与返回事件或链接；末项标记当前页，`headingLevel` 使末项承担页面标题。用于下钻时替换原页头，不新增独立标题行。

`Collection` 的数量位于结果区，`actions` 槽位可放排序；共用 `.vx-results-head` 实现左侧结果数、右侧排序，同一行呈现。有时间筛选时将其置于筛选组首项。

## 空状态、数据时间与操作自适应

- `EmptyState` 是列表、表格和卡片空状态的唯一内容组件。默认 section 与正文左侧对齐、普通字号、辅助文字色和统一间距，不增加空表头、重复零计数或装饰图标；整页列表用 page 居中，可传语义图标。文案先说明“暂无什么”或“没有符合筛选条件的什么”，只有有帮助时才补原因与真实操作。请求失败与无权限不能伪装成空数据。
- `SectionCard updatedAt` / `SectionHeader updatedAt` 使用 `DataTime` 在标题区右侧呈现源数据时间。只在新鲜度影响判断且有可靠来源时显示；没有来源不补当前时间，不拿查看时间或业务截止时间充当更新时间。统计期间留在范围控件，逐行更新时间不同则归属于各记录。窄屏可在标题区内换行，仍居右。
- 表格保留可读列宽并使用 `TableScroll` 局部滚动；短动作标签不拆字，输入框有稳定的可操作宽度，操作组整体换行。普通长按钮可以换行时，按钮高度随内容增长，禁止固定高度裁字。
- 对话发送使用 `.vx-composer-send`，不要混用主按钮与通用图标按钮的颜色规则。可发送时深底亮色图标；空输入禁用时浅底辅助色图标，禁用不响应悬停。

工作区 `Tabs keepMounted` 保留各页签实例，`hidden` 隐藏整个页签组；应用按会话保存组、当前页签与开关，并给页面实例提供其自身上下文。关闭整个右侧放在 `actions`，恢复图标用 `open-workspace`；`.vx-app[data-render="closed"]` 让对话占满剩余空间。
