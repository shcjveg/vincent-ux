<div align="center">

# ░▒▓ Vincent-UX

**面向桌面 Agent 工作台的设计系统。**

暖中性色 · 浅深主题 · CSS / React · 人与 AI 协作

[快速体验](#快速体验) · [接入项目](#接入项目) · [设计指南](#设计指南)

</div>

从搜索、表单和内容列表，到对话、决策卡与多页签工作区，为你的产品提供一套连贯的界面语言。按需取用配色、组件或页面骨架，在自己的项目里自由组合。

## 设计理念

- **意图优先**。先分清来人是在了解、比较还是行动。改变入口或布局，仍保留这一步真正需要的信息与动作。
- **表达服务判断**。用稳定的位置帮助比较，用有意义的色彩、字形和节奏建立辨识度。让品牌、主要操作和业务异常各有清楚的表达。
- **行为可预期**。操作前能预判何时生效、影响谁。失败、返回或后台产生新内容时，仍找得到原来的输入、结果和阅读位置。
- **用户有决定权**。用户可以比较方案、改变主意，决定何时交办；已授权的轻操作可以直接完成并提供撤销。

评审新页面时，可以各取一个真实任务、一组长短不齐的数据和一次会失败的操作，逐项核对。[把原则用在新页面上](principles/README.md#把原则用在新页面上)

**收录原则**：围绕同类工作台中反复出现的设计问题，沉淀可跨产品复用的视觉语言、组件与交互模式，让不同页面拥有一致的使用体验。

## 快速体验

需要 Node.js 22.12+，推荐使用 Node.js 24。

```bash
git clone https://github.com/shcjveg/vincent-ux.git
cd vincent-ux
npm ci
npm run showcase
```

项目使用指南按当前要完成的事分为设计界面、接入项目、验收产品界面、改进设计系统。演示目录按整页任务、组件用法、视觉要素浏览；从演示打开规范后可以返回原来的章节与配色。[展示与验收](http://127.0.0.1:5190/showcase/#handbook)

## 接入项目

在完整设计系统仓库中执行以下命令。命令将所需文件复制到产品的独立目录，并生成一份注明版本、依赖和示例路径的 `README.md`。

```bash
npm run sync -- ../my-app/src/vincent-ux
```

整页接入使用 `styles.css`；在已有产品里嵌入一个模块时使用 `embedded.css` 和 `ThemeScope`。React 组件和表单提交行为从 `react/index.ts` 导入。纯 HTML 项目可加 `--no-react`。[整页 HTML 示例](http://127.0.0.1:5190/examples/basic.html) · [嵌入式 React 示例](http://127.0.0.1:5190/examples/embedded/)

同步后可从副本的 `guide.html` 按任务查找原则与案例。在使用方的 CI 运行 `node src/vincent-ux/tools/check.mjs src`。已有副本先用 `--dry-run` 预览更新和本地定制。[接入指南](docs/usage.md) · [旧版升级](docs/usage.md#升级已有副本)

## 设计指南

| 你想做什么 | 从这里开始 |
|---|---|
| 设计没有现成组件的任务，找到组合和验收方法 | [按任务做设计](docs/tasks.md) · [批量改交期示例](examples/batch/index.html) |
| 理解视觉、内容、交互与无障碍约定 | [设计原则](principles/README.md) |
| 选择配色主题，调整字号、间距与动效 | [配色接入](docs/usage.md#从三种品牌色接入) · [设计变量](tokens/src/) |
| 按功能含义选择图标 | [图标指南](icons/README.md) |
| 为当前任务选对组件 | [组件指南](components/README.md) |
| 组织内容浏览、AI 分工与关键决策 | [交互模式](patterns/README.md) |
| 搭建导航、对话和多页签工作区 | [页面模板](templates/README.md) |

各层的改造、可运行示例和验收边界见[按系统层核验](docs/coverage.md#按系统层核验)。让 AI 也用同一套设计语言：[Agent 使用说明](SKILL.md)。

## 开源

[MIT](LICENSE) · [更新记录](CHANGELOG.md) · [参与贡献](CONTRIBUTING.md) · [安全报告](SECURITY.md)

使用、修改与分发时保留许可证及 [第三方声明](THIRD_PARTY_NOTICES.md)；复制工具会一并带上所需文件。
