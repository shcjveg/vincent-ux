---
name: vincent-ux
description: 按 vincent-ux 设计系统写界面。生成或修改桌面 agent 工作台类页面（左导航、对话、多页签渲染区）、数据与运营工作台页面时使用；用户提到 vincent-ux、设计系统、按规范出页面时使用。
---

<!-- vincent-ux v1.3.0 · SKILL.md -->

# 用 vincent-ux 写界面

以本文件所在目录作为设计系统根目录；使用项目内副本时，以副本所在目录为根目录。下列路径都相对该根目录。

1. 先读 `principles/README.md` 理解基础原则与冲突决策，再用 `components/README.md` 选组件；应用骨架读 `templates/README.md`，整页组合读 `patterns/page-composition.md`。内容浏览读 `patterns/browse.md`，涉及 AI 分工时按 `patterns/README.md` 选择对应模式。
2. 按 `README.md` 安装并启动展示页，顶部是真实 React 行为示例，下方是外观参考。优先使用已有交互组件；纯 CSS 外观需要自行实现对应行为和语义。
3. 接入时运行 `scripts/sync.mjs <目标目录> --dry-run` 查看计划，然后拷贝。默认遇到内容冲突停止；按项目已有授权和合并方式处理，不直接覆盖使用方改动。整体样式入口是 `styles.css`，纯 HTML 示例是 `examples/basic.html`；保留文件来源标记。
4. 实现前读 `principles/visual.md` 和 `principles/interaction.md`，分别作为颜色／刻度与状态／反馈的唯一规则来源。标签、键盘、焦点和对比度按 `principles/accessibility.md`，文案按 `principles/content.md`。图标按 `icons/icons.json` 的含义选用。
5. 完成后跑 `node scripts/check.mjs <使用方源码目录>`，在实际页面加载 `scripts/audit.js` 调 `vxAudit()`，并验证本次涉及的键盘流程、加载／失败／空状态与浅深主题。无发现仅代表自动覆盖项通过，仍需核对实际内容和交互。修改设计系统自身时另跑 typecheck、test 和 build:showcase。

只把可复用的语义、组件和交互约定补进系统；产品专属流程放在产品里。变量源修改后运行 build，图标映射修改后运行 icons。精确命令与依赖以 `package.json` 为准。
