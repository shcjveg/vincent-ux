# 设计沉淀覆盖表

本表覆盖至 v1.8.0 的界面改进。沉淀完成需同时满足：规则能被找到、旧说法已修正、组件可复用、示例能操作、关键行为可验证、导出资源一致。修改本表引用的规范原文，不再另存一份规则副本。

## 按系统层核验

| 系统部分 | 具体改造或保留的实现 | 验收入口 |
|---|---|---|
| 颜色、表面与主操作 | 22 套主题提供页面、文本、操作、反馈和焦点角色；局部主题和整页消费同一规则 | [主题与阅读回归](../tests/design-principles.spec.ts) |
| 排版、形状与留白 | 字号随根字号缩放，控件有最小高度并随文字增长。公共 CSS 的字号、内外边距、间隔和圆角接入刻度。卡片标题可按宿主文档选标题级别。320px 宽叠加两倍字号时，任务状态与长按钮换行 | [基础变量](../tokens/src/base.tokens.json) · [刻度检查](../scripts/check.mjs) · [嵌入项目](../tests/consumer.spec.ts) |
| 图标与命中区 | HTML 和 React 图标使用同一尺寸刻度；分页用语义图标。独立操作的命中区随输入方式变化，关闭页签同步预留空间 | [图标清单一致性](../tests/tooling.test.mjs) · [触控回归](../tests/system-contracts.spec.ts) |
| 组件组合与页面空间 | 表单栅格、筛选搜索、门户按自身宽度重排；工作区测量实际占宽决定导航和对话的呈现方式 | [桌面内嵌窄模块、键盘登录与工作区草稿](../tests/system-contracts.spec.ts) |
| 文案、查询与数据反馈 | 展示当前查询的范围，失败时仍可读上次成功结果。重试使用失败请求的条件，主动查询使用新条件，零条明细有明确反馈。通用集合只显示业务提供的后续说明 | [查询模式](../patterns/browse.md#已应用的查询范围) · [导出与响应顺序](../tests/design-principles.spec.ts) |
| 导航、选择与焦点 | 清除选择时优先回到原入口，入口被筛选移走后可回到结果区。外壳跨宽度保留输入。页签、面包屑、历史与模态沿用已有交互 | [焦点与返回](../tests/system-contracts.spec.ts) · [面包屑](../tests/breadcrumbs.spec.ts) · [工作区](../tests/workspace-state.spec.ts) |
| 等待、动效与无障碍 | 等待动画使用共用时长。减少动态效果时退出分批入场的等待。已有字段关联、键盘操作、强制色彩样式和浅深主题检查继续生效 | [动效与字号回归](../tests/system-contracts.spec.ts) · [语义与对比检查](../tests/components.spec.ts) |
| 任务、指标与 AI 会话 | 复核原有的选择后确认、处理后进入历史、指标与时点说明、持续输出时回读。生命周期与结果由业务回调驱动 | [任务与指标](../tests/components.spec.ts) · [会话回读](../tests/design-principles.spec.ts) |
| 跨项目使用原则 | 任务索引连接规则、案例与验收，随副本交付。批量改交期使用已有表格、表单与按钮，并在逐笔回执后只重试失败项 | [按任务做设计](tasks.md) · [批量重试](../tests/batch.spec.ts) |
| 交付与升级 | 整页与嵌入样式由同一源码构建。临时宿主只取同步副本，通过严格 TypeScript 编译，验证整页筛选与空结果、局部样式隔离、标题、保存和重试。副本自带同版指南、静态检查器和升级清单，首次升级旧版可指定干净原件。质量检查能辨认原样同步的文件，也能指出宿主样式的直接品牌色引用 | [独立接入回归](../tests/consumer.spec.ts) · [升级回归](../tests/tooling.test.mjs) |

组件参数另以真实任务验收。报表直接点选两个地区，日期快捷项显示实际起止，长列表在矮视口可点到末项。对话回读的距离随字号变化，新段落到达时保留阅读位置。[输入与选择](../components/README.md#3-输入与选择) · [按行高回读与长列表回归](../tests/design-principles.spec.ts) · [列表容量原例 02:20](https://www.xiaohongshu.com/discovery/item/6adbda97000000002c01621b) · [阅读距离原例 01:01](https://www.xiaohongshu.com/discovery/item/6ada3150000000002c0144b0)

这些验收覆盖参考实现与公开接口。实际读屏软件的播报、用户是否能从第一眼判断业务含义，以及业务服务端的数据权限和保存结果，需要在相应产品里验证。

## 按任务查找依据

开始设计时可先读[任务索引](tasks.md)。下表记录具体实现和各项核验的责任。

| 通用问题 | 规则来源 | 组件与可运行示例 | 验证与责任 |
|---|---|---|---|
| 桌面和手机都有入口，用户却无法办完同一件事 | [跨端保留任务](../patterns/page-composition.md#跨端保留任务) | [门户登录](../showcase/PortalExample.tsx) | [原则回归](../tests/design-principles.spec.ts)用同一账号在 1440／390px 提交、修正、进入看板、返回。实际产品另观察首次访问者能否主动找到入口 |
| 长短摘要或缺失字段干扰相邻对象的比较 | [强调与比较](../principles/visual.md#强调与比较) | [内容集合示例](../showcase/react.tsx)中的长、短、无摘要记录 | [原则回归](../tests/design-principles.spec.ts)核对两种布局的对象、状态与日期及同排卡片的字段对齐。评审另请读者只看主层级说出判断 |
| 同屏偏好和表单字段生效时间不同 | [操作何时生效](../principles/interaction.md#操作何时生效) | [发布设置](../showcase/SettingsExample.tsx)、`ThemeToggle`、`Checkbox`、`DateFilter` | [原则回归](../tests/design-principles.spec.ts)核对取消、刷新、写入失败、重试与导出文件。[日期组件测试](../tests/components.spec.ts)核对「应用」前后的比较范围 |
| 编辑新条件时误导出旧结果以外的对象 | [已应用的查询范围](../patterns/browse.md#已应用的查询范围) | [明细查询](../showcase/ReportExample.tsx) | [原则回归](../tests/design-principles.spec.ts)核对下钻、失败、并发查询与导出的逐条记录。宿主负责服务端范围和权限 |
| 连续回复把读者从旧内容拉到底部 | [持续输出与回读](../patterns/page-chat-flow.md#持续输出与回读) | [ChatTranscript](../components/react/ChatTranscript.tsx)、[工作区示例](../showcase/WorkspaceDemo.tsx) | [原则回归](../tests/design-principles.spec.ts)核对跟随、回读、会话恢复和键盘返回。宿主按会话保留阅读位置 |
| 按钮有品牌色，但正文和注释抢眼程度相近，选中行的小字变淡 | [文字三级](../principles/visual.md#文字三级) | [阅读卡与配色对照](../showcase/index.html#text-colors)、门户及导览链接 | `npm run check` 核对实际表面、选中、悬停、淡色底的文字对比度和常用层级顺序。[浏览器测试](../tests/design-principles.spec.ts)核对 22 套浅深主题的文字角色与行内导航 |
| 嵌入其他产品时，按钮重置污染宿主、弹窗脱离主题 | [接入边界](usage.md#按产品边界接入) | `embedded.css`、`ThemeScope`、作用域内的浮层 | [独立接入回归](../tests/consumer.spec.ts) 在临时项目构建同步副本，实际打开弹窗、切换明暗、检查宿主 |
| 保存失败后丢草稿，或把草稿当作生效值 | [保存与重试](usage.md#保存与重试) | `useDraftForm`、设置表单和嵌入编辑器 | 独立接入回归与[展示页交互](../tests/design-principles.spec.ts)覆盖失败、重试与刷新 |
| 不同调性的产品只能共用一套配色 | [视觉原则 · 颜色只表达意义](../principles/visual.md)、[使用指南 · 配色与主题](usage.md#配色与主题)、[分类调研](research/color-theme-taxonomy.md) | `data-palette` + `tokens/src/palettes.json`；[展示页](../showcase/index.html) 颜色 › 配色主题 | `npm run check`：22 套主题浅色／暗色对比度、强调色与危急色色相间隔；[组件测试](../tests/components.spec.ts)：配色切换和深链接改变门户主按钮，键盘与浅深模式仍可用 |
| 原型组合已更新但组件规范与展示仍停留在旧结构 | [收起与展开](../components/disclosure.md)、[组件指南](../components/README.md) | `Fold` 分组／详情／编辑、行内步骤与对话过程；[ComponentExamples](../showcase/ComponentExamples.tsx) | [收纳回归](../tests/disclosure.spec.ts)：摘要显隐、独立分组、输入保留、明确放弃草稿、键盘和过程状态；展示页筛选、指标与外壳直接使用真实组件 |
| AI 反馈和普通业务操作混用 | [待办工作页](../patterns/task-workspace.md)、[关键节点拍板](../patterns/decision.md) | `TaskCard` / `TaskStatus`；[TaskCardDemo](../showcase/react.tsx) | [组件测试](../tests/components.spec.ts)：选择不提交、自定义要求、提交中锁定、失败重试、交办与历史；产品另查反馈是否集中在应用待办与全局汇总 |
| 历史增加重复层级，处理记录失去原选择 | [历史二级页](../patterns/task-workspace.md#历史二级页) | `Breadcrumbs` / `completedChoice` / `completedAction`；TaskCardDemo | [面包屑独立回归](../tests/breadcrumbs.spec.ts)：唯一路径页头、键盘返回、范围保留、历史空态；组件测试：历史锁定与对话入口；宿主负责原会话、快照和版本对应 |
| 筛选、数量、排序混在不同层级 | [内容浏览](../patterns/browse.md)、[范围与排序](../patterns/task-workspace.md#范围与排序) | `Select` / `DateFilter` / `SortMenu` / `Collection`；BrowserDemo、TaskCardDemo | 组件测试：全部首项、搜索、日期取消／应用、单一时间口径只显示范围、排序独立于日期、结果数量随筛选更新、连续切月与切月后键盘入口 |
| 明暗切换各页自写，嵌入宿主后默认值和记忆互相覆盖 | [组件指南](../components/README.md)、[使用指南 · 配色与主题](usage.md#配色与主题) | `ThemeToggle` / `.vx-theme-toggle`；展示页左下角与设置区共享整页偏好，嵌入模块可独立切换 | [组件测试](../tests/components.spec.ts)：点击切换、名称说明下一步、记住选择且优先于根元素默认值；左下角其它浮钮由使用方让到其上方 |
| 外壳没有用户卡片时，身份与账户动作无处安放 | [组件指南](../components/README.md) | `UserMenu`；展示页「交互与状态 › 弹层与页签」页签条右侧 | 组件测试：不进入页签键盘顺序、点开显示名字与身份、Esc 关闭并把焦点还给头像 |
| 批量操作散落在结果区顶部与行内，已选范围不清楚 | [批量操作条](../patterns/browse.md#批量操作条) | `SelectionBar`；BrowserDemo | 组件测试：选中出现、取消消失、筛选外数量、Esc 取消与焦点恢复 |
| 抽屉里分区重叠、靠卡片粗线收起展开，字段样式与编辑出口各不相同 | [抽屉详情](../components/drawer.md) | `DetailDrawer` / `DrawerSection` / `Property` / `.vx-log`；DetailDrawerDemo | 组件测试：查看态无控件、编辑后同位置出现控件、计算字段不可编辑、分区红点在标题左上角、底部只有一个出口；视觉检查：只有极细线分隔、文字三档 |
| 列表里看不出哪些对象等我处理，筛选不知道各类有多少 | [对象列表与筛选](../patterns/todo-and-badge.md#对象列表与筛选) | `Select attention` / 选项 `attention` / `AttentionMark`；BrowserDemo | 组件测试：触发器有点不计数、选项行尾计数、零项无计数、行标题左上角红点不改变文字位置 |
| 对客入口与内部工作台一样朴素，缺少品牌感；或为了“高级”到处加渐变与动效 | [对客门户](../templates/README.md) | `.vx-portal` / `PortalFeed` / `.vx-portal-hero` / `.vx-rise`；PortalExample | 组件测试：氛围层对读屏隐藏、快捷登录可键盘触发、减少动态效果时动画停住；视觉检查：唯一强调色、无真实内容 |
| 「拖了一阵」和「已经阻断」都用红色，用户分不清哪件更急 | [视觉原则 · 颜色只表达意义](../principles/visual.md)、[使用指南 · 配色与主题](usage.md#配色与主题) | `--vx-brand-warning` / `--vx-brand-warning-soft`、`[data-tone='warning']`、`.vx-tag--warning` / `.vx-text-warning`；OrganismsExamples 状态列 | `npm run check`：22 套配色下警示色对比度与色相间隔；视觉检查：warning 只用于未到阻断的一档 |
| 导览遮住被讲解的目标，或讲弹窗里的操作时弹窗把说明卡锁在外面 | [功能导览](../patterns/guide.md) | `Guide variant="banner"` 贴底／换顶、`Dialog modal={false}`；[GuideDemo](../showcase/react.tsx) | [组件测试](../tests/components.spec.ts)：挡住目标时换到顶部、挡住不了回到底部、超高目标只框可见部分；横幅动作保持同一行 |
| 动作按钮上的提示被点开固定，挡住后续弹窗 | [组件指南](../components/README.md) | `Tip` / `TextTip`；InteractionDemo 导出按钮 | 组件测试：动作按钮的提示只随悬停出现、点击执行后收起、不固定；说明型触发器仍可点击固定 |
| 展开收起闪断，关闭后的输入与子组件状态丢失 | [收起与展开](../components/disclosure.md) | `Fold` / `.vx-fold-inner`；DisclosureExamples | [收纳回归](../tests/disclosure.spec.ts)：高度过渡、关闭后内容 `inert` 且不进入键盘顺序、重开保留输入 |
| 搜索框和筛选项挤在同一行互相换行，条件区跳动 | [浏览与筛选](../patterns/browse.md)、[组件指南](../components/README.md) | `FilterBar side` / `.vx-filterbar-side`；BrowserDemo | 组件测试：搜索框位于侧栏、筛选项自行换行、320px 整列落到筛选项下方 |
| 设置页的明暗切换只能浮在左下角 | [组件指南](../components/README.md) | `ThemeToggle variant="inline"`；SettingsExample 浏览偏好行 | 组件测试：普通小按钮写出当前模式、点击切换并记住选择 |
| 点击或切换后错误清除提醒 | [待办与红点](../patterns/todo-and-badge.md) | `Attention` / `AttentionTitle` / `TaskCard` / `Tabs.indicator` | 组件测试：选中态红点保留、标签宽度稳定、完成终点消失；宿主负责同一未处理实例集合及旧实例不重复提醒 |
| 空状态随页面变化，更新时间摆放无依据 | [空状态与数据时间](../components/README.md#空状态数据时间与操作自适应) | `EmptyState` / `DataTime` / `SectionCard updatedAt`；[ComponentStatesDemo](../showcase/WorkspaceDemo.tsx) | [工作区与状态测试](../tests/workspace-state.spec.ts)：同类空态样式一致、无需动作时不加按钮、可靠时间居右、无来源不生成时间 |
| 窄区域裁字、按钮与表格挤坏 | [空间按内容分配](../patterns/page-composition.md#空间按内容分配) | `Button` / `TableScroll`；ComponentStatesDemo | 320／390／1440px：短按钮完整、长动作增高、表格局部滚动；实际产品另查最长数据和组合宽度 |
| 侧栏收起后图标偏移、用户入口重复 | [导航](../patterns/nav-overflow.md)、[模板](../templates/README.md) | `.vx-nav` / `ActionMenu` / `WorkspaceOverlay`；WorkspaceDemo | 工作区测试：同一图标中线、头像单入口、手机抽屉焦点与 Esc 恢复 |
| 隐藏页面丢失上下文，切换会话互相覆盖 | [页面与对话](../patterns/page-chat-flow.md) | `Tabs keepMounted/hidden` / `.vx-app[data-render="closed"]`；WorkspaceDemo | 工作区测试：两个会话独立保存页签、输入、搜索、滚动、右侧开关；宿主负责持久化、订阅与业务数据同步 |
| 发送按钮启禁状态难以辨认 | [组件状态](../components/README.md#空状态数据时间与操作自适应)、[派活](../patterns/delegate.md) | `.vx-composer-send`；WorkspaceDemo | 浅深主题测试：禁用悬停不变、启用可辨、发送后清空、无障碍扫描；输入法完整流程由宿主检查 |
| React 与 HTML 接入得到不同图标 | [图标指南](../icons/README.md)、[接入](usage.md) | `icons.json` → React `Icon` 与 `sprite.svg`；构建生成 75 个语义图标 | [工具链测试](../tests/tooling.test.mjs)：清单、React 语义与复制后的 HTML 图标集合一致 |

## 历次规范修正

修正了旧文档中“空状态必须带动作”“每页固定加一句话”“所有禁用统一透明度”“入口带数字”“侧栏收起仍有附加操作”“顶部重复上下文说明”等冲突。会话状态归属从追加说明补成完整模式，文档入口、模板、组件与示例互相连接；新增图标随常规构建生成，展示页版本号读取包版本。

浅深主题与 320／390px 的新示例有自动检查。设计系统测试证明组件行为与示例契约；页面业务是否正确、来源时间是否可信、是否遗漏待办、是否持久化成功，必须由使用方在真实流程中验证。自动审计未报错不能替代这些检查。

## 更新方式

修订原则、回补案例与增加组件的步骤见[贡献指南](../CONTRIBUTING.md#从一个案例改进系统)。已有产品按[升级已有副本](usage.md#升级已有副本)预览差异，并在使用项目中验收受影响的任务。
