# 设计目标与验收标准

本文记录公开版的范围与验收入口。设计系统服务桌面级 Agent 工作台；具体产品的流程、数据与页面清单由使用方维护。

## 设计目标

- **意图优先**：呈现判断需要的对象、状态、影响与下一步，按需展开依据。
- **表达服务判断**：用对齐、留白、明度与一致的语义降低辨认成本；由主题定义基础色和主动作色，保留独立的状态语义。
- **行为可预期**：保留操作上下文、焦点与输入，完整处理加载、空、失败、完成和恢复。
- **用户有决定权**。允许改选与放弃，外部执行遵循授权范围；关键决定可转人工，可逆操作提供恢复入口。
- **独立复用**：原则、变量、图标、组件、模式、模板各自负责一层；支持纯 HTML／CSS 和 React，按需复制。
- **可迭代与溯源**：变量从单一数据源生成；公开版本用标签、更新记录和文件来源标记追踪。

具体规则以 `principles/` 为准；组件、模式和模板引用规则，不重复定义。

## v1.9.0 验收入口

| 范围 | 验收内容 | 入口 |
|---|---|---|
| 跨项目复用与升级 | 副本可查到设计依据和独立案例，能检查宿主样式，升级保留本地定制并报告双方改动 | [设计要求与验收](docs/tasks.md)、[升级方法](docs/usage.md#升级已有副本)、[工具回归](tests/tooling.test.mjs) |
| 设计原则 | 同一任务跨端能办完，同类对象可比较，用户能区分草稿与已生效范围，持续输出能保住回读位置，选方案后仍可改选或接管 | [原则与评审问题](principles/README.md#把原则用在新页面上)、[示例回归](tests/design-principles.spec.ts)、[验证边界](docs/coverage.md) |
| 设计变量与图标 | 可重复生成，浅深主题语义一致，所有配色主题逐套满足对比度与色相间隔，警示／危急语气可区分，变量与含义映射可检查 | `npm run build`、`npm run icons`、`npm run check` |
| 组件交互 | 搜索、筛选与日期；表单、浮层、页签、导览横幅避让与非模态弹窗、决定与待办卡的提交中／失败／历史状态 | `npm test`、`showcase/` |
| 可访问性 | 标签、键盘、焦点恢复、对比度与浅深主题自动扫描 | `tests/components.spec.ts`、`tests/disclosure.spec.ts`、`tests/workspace-state.spec.ts`、`principles/accessibility.md` |
| 页面用色 | 明暗两种模式下对照色卡与真实页面。阅读区、品牌入口和主操作各有清晰的视觉权重 | [页面用色分工](principles/visual.md#按页面任务分配颜色)、[主题预览](showcase/index.html#palettes)、[浏览器回归](tests/design-principles.spec.ts) |
| 页面组合 | 桌面与 320／390px 窄屏、会话切换和关闭恢复、内容锚点、局部滚动与导览避让 | `patterns/page-composition.md`、`patterns/page-chat-flow.md`、浏览器测试 |
| 消费链路 | 整页与局部入口、版本说明、图标和许可齐全；验证冲突预览、重复同步、独立宿主的严格类型编译与真实操作 | `examples/basic.html`、`examples/embedded/`、`tests/tooling.test.mjs`、`tests/consumer.spec.ts` |
| 工程与发布 | 类型、展示页构建、隐私检查和可复现依赖安装 | `npm run typecheck`、`npm run build:showcase`、`npm run check:privacy`、CI |

近期能力的规则、示例与验证对应关系见[沉淀覆盖表](docs/coverage.md)。自动扫描只覆盖已编码的规则；实际接入仍需检查长内容、缩放、完整键盘流程和读屏体验。

## 当前边界

提供工作区、浮层与内容组件的窄屏适配；完整手机产品的信息架构和业务流程仍由宿主设计。当前不提供多密度主题、从右到左布局、Figma 组件库、Storybook 或完整多语言框架。Token 为项目内部的 DTCG 风格数据，不承诺兼容所有外部工具。版本与升级影响见 `CHANGELOG.md`。
