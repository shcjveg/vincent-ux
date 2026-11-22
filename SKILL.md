---
name: vincent-ux
description: 按 vincent-ux 设计系统写界面。生成或修改桌面 agent 工作台类页面（左导航、对话、多页签渲染区）、数据与运营工作台页面时使用；用户提到 vincent-ux、设计系统、按规范出页面时使用。
---

<!-- vincent-ux v1.7.0 · SKILL.md -->

# 用 vincent-ux 写界面

以下规范、脚本路径都相对包含本文件的完整设计系统仓库。使用 `sync` 生成的项目副本时，先读副本根目录的 `README.md`，从副本的 `react/` 和样式入口取用实现。检查与更新命令在完整仓库中执行，目标指向使用项目。

1. 先读 `principles/README.md` 理解基础原则与冲突决策，再用 `components/README.md` 选组件；应用骨架读 `templates/README.md`，整页组合读 `patterns/page-composition.md`。内容浏览读 `patterns/browse.md`；会话或多页签状态读 `patterns/page-chat-flow.md`，AI 反馈及历史读 `patterns/task-workspace.md`，入口提醒读 `patterns/todo-and-badge.md`。
2. 按 `README.md` 安装并启动展示页，顶部是真实 React 行为示例，下方是外观参考。优先使用已有交互组件；纯 CSS 外观需要自行实现对应行为和语义。
3. 接入时运行 `scripts/sync.mjs <目标目录> --dry-run` 查看计划，然后拷贝。默认遇到内容冲突停止；按项目已有授权和合并方式处理，不直接覆盖使用方改动。整页用 `styles.css`。嵌入已有产品用 `embedded.css` 与 `ThemeScope`，按 `docs/usage.md` 选择作用域和行为模块。纯 HTML 示例是 `examples/basic.html`；保留文件来源标记。
4. 实现前读 `principles/visual.md` 和 `principles/interaction.md`，分别作为颜色／刻度与状态／反馈的唯一规则来源。标签、键盘、焦点和对比度按 `principles/accessibility.md`，文案按 `principles/content.md`。图标按 `icons/icons.json` 的含义选用。
5. 完成后跑 `node scripts/check.mjs <使用方源码目录>`，在实际页面加载 `scripts/audit.js` 调 `vxAudit()`，并验证本次涉及的键盘流程、加载／失败／空状态与浅深主题。无发现仅代表自动覆盖项通过，仍需核对实际内容和交互。修改设计系统自身时另跑 build、typecheck、test 和 build:showcase，并按 `docs/coverage.md` 核对规则、组件、可运行示例、验证与导出是否一致。

只把可复用的语义、组件和交互约定补进系统；产品专属流程放在产品里。build 同时生成变量和图标；仅更新图标可单独运行 icons。精确命令与依赖以 `package.json` 为准。
