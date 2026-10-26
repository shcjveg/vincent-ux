# 设计沉淀覆盖表

以 v1.4.1（2026-10-26）的近期界面改进为核对范围。沉淀完成需同时满足：规则能被找到、旧说法已修正、组件可复用、示例能操作、关键行为可验证、导出资源一致。修改本表引用的规范原文，不再另存一份规则副本。

| 通用问题 | 规则来源 | 组件与可运行示例 | 验证与责任 |
|---|---|---|---|
| 原型组合已更新但组件规范与展示仍停留在旧结构 | [收起与展开](../components/disclosure.md)、[组件指南](../components/README.md) | `Fold` 分组／详情／编辑、行内步骤与对话过程；[ComponentExamples](../showcase/ComponentExamples.tsx) | [收纳回归](../tests/disclosure.spec.ts)：摘要显隐、独立分组、输入保留、明确放弃草稿、键盘和过程状态；展示页筛选、指标与外壳直接使用真实组件 |
| AI 反馈和普通业务操作混用 | [待办工作页](../patterns/task-workspace.md)、[关键节点拍板](../patterns/decision.md) | `TaskCard` / `TaskStatus`；[TaskCardDemo](../showcase/react.tsx) | [组件测试](../tests/components.spec.ts)：选择不提交、自定义要求、提交中锁定、失败重试、交办与历史；产品另查反馈是否集中在应用待办与全局汇总 |
| 历史增加重复层级，处理记录失去原选择 | [历史二级页](../patterns/task-workspace.md#历史二级页) | `Breadcrumbs` / `completedChoice` / `completedAction`；TaskCardDemo | [面包屑独立回归](../tests/breadcrumbs.spec.ts)：唯一路径页头、键盘返回、范围保留、历史空态；组件测试：历史锁定与对话入口；宿主负责原会话、快照和版本对应 |
| 筛选、数量、排序混在不同层级 | [内容浏览](../patterns/browse.md)、[范围与排序](../patterns/task-workspace.md#范围与排序) | `Select` / `DateFilter` / `SortMenu` / `Collection`；BrowserDemo、TaskCardDemo | 组件测试：全部首项、搜索、日期取消／应用、排序独立于日期、结果数量随筛选更新、连续切月与切月后键盘入口 |
| 点击或切换后错误清除提醒 | [待办与红点](../patterns/todo-and-badge.md) | `Attention` / `AttentionTitle` / `TaskCard` / `Tabs.indicator` | 组件测试：选中态红点保留、标签宽度稳定、完成终点消失；宿主负责同一未处理实例集合及旧实例不重复提醒 |
| 空状态随页面变化，更新时间摆放无依据 | [空状态与数据时间](../components/README.md#空状态数据时间与操作自适应) | `EmptyState` / `DataTime` / `SectionCard updatedAt`；[ComponentStatesDemo](../showcase/WorkspaceDemo.tsx) | [工作区与状态测试](../tests/workspace-state.spec.ts)：同类空态样式一致、无需动作时不加按钮、可靠时间居右、无来源不生成时间 |
| 窄区域裁字、按钮与表格挤坏 | [空间按内容分配](../patterns/page-composition.md#空间按内容分配) | `Button` / `TableScroll`；ComponentStatesDemo | 320／390／1440px：短按钮完整、长动作增高、表格局部滚动；实际产品另查最长数据和组合宽度 |
| 侧栏收起后图标偏移、用户入口重复 | [导航](../patterns/nav-overflow.md)、[模板](../templates/README.md) | `.vx-nav` / `ActionMenu` / `WorkspaceOverlay`；WorkspaceDemo | 工作区测试：同一图标中线、头像单入口、手机抽屉焦点与 Esc 恢复 |
| 隐藏页面丢失上下文，切换会话互相覆盖 | [页面与对话](../patterns/page-chat-flow.md) | `Tabs keepMounted/hidden` / `.vx-app[data-render="closed"]`；WorkspaceDemo | 工作区测试：两个会话独立保存页签、输入、搜索、滚动、右侧开关；宿主负责持久化、订阅与业务数据同步 |
| 发送按钮启禁状态难以辨认 | [组件状态](../components/README.md#空状态数据时间与操作自适应)、[派活](../patterns/delegate.md) | `.vx-composer-send`；WorkspaceDemo | 浅深主题测试：禁用悬停不变、启用可辨、发送后清空、无障碍扫描；输入法完整流程由宿主检查 |
| React 与 HTML 接入得到不同图标 | [图标指南](../icons/README.md)、[接入](usage.md) | `icons.json` → React `Icon` 与 `sprite.svg`；构建生成 67 个语义图标 | [工具链测试](../tests/tooling.test.mjs)：清单、React 语义与复制后的 HTML 图标集合一致 |

## 本轮补齐

修正了旧文档中“空状态必须带动作”“每页固定加一句话”“所有禁用统一透明度”“入口带数字”“侧栏收起仍有附加操作”“顶部重复上下文说明”等冲突。会话状态归属从追加说明补成完整模式，文档入口、模板、组件与示例互相连接；新增图标随常规构建生成，展示页版本号读取包版本。

浅深主题与 320／390px 的新示例有自动检查。设计系统测试证明组件行为与示例契约；页面业务是否正确、来源时间是否可信、是否遗漏待办、是否持久化成功，必须由使用方在真实流程中验证。自动审计未报错不能替代这些检查。

## 更新方式

规则变更先改唯一规范来源，再更新受影响的引用与示例。新增行为补交互回归；文案和索引调整核对链接与冲突。运行 `npm run build`、`npm run typecheck`、`npm test`、`npm run check`、`npm run build:showcase`；按 [接入指南](usage.md) 比较并同步消费方。具体行业对象、流程、业务状态机与产品文案留在产品需求中。
