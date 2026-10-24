<div align="center">

# ░▒▓ Vincent-UX

**面向桌面 Agent 工作台的设计系统。**

暖中性色 · 浅深主题 · CSS / React · 人与 AI 协作

[快速体验](#快速体验) · [接入项目](#接入项目) · [设计指南](#设计指南)

</div>

从搜索、表单和内容列表，到对话、决策卡与多页签工作区，为你的产品提供一套连贯的界面语言。按需取用配色、组件或页面骨架，在自己的项目里自由组合。

## 设计理念

- **任务清楚**：把对象、状态和下一步讲明白，判断所需的信息放在眼前。
- **感知省力**：用对齐、留白与明度建立层次，让强调留给真正需要注意的地方。
- **行为可预期**：操作有反馈，等待有状态，出错能恢复，上下文与焦点跟得上。

**收录原则**：围绕同类工作台中反复出现的设计问题，沉淀可跨产品复用的视觉语言、组件与交互模式，让不同页面拥有一致的使用体验。

## 快速体验

需要 Node.js 22.12+，推荐使用 Node.js 24。

```bash
git clone https://github.com/shcjveg/vincent-ux.git
cd vincent-ux
npm ci
npm run showcase
```

打开 [本地展示页](http://127.0.0.1:5190/showcase/)，切换浅深主题，试试搜索筛选、表单、弹层和功能导览。

## 接入项目

在本仓库目录执行，将界面资源复制到你的项目：

```bash
npm run sync -- ../my-app/src/vincent-ux
```

引入输出目录的 `styles.css` 使用样式，React 组件从 `react/index.ts` 导入。纯 HTML 项目加 `--no-react`；复制后可以按自己的产品需要修改。

依赖安装、代码示例、按层取用与更新方式见 [接入指南](docs/usage.md)。

## 设计指南

| 你想做什么 | 从这里开始 |
|---|---|
| 理解视觉、内容、交互与无障碍约定 | [设计原则](principles/README.md) |
| 调整配色、字号、间距与动效 | [设计变量](tokens/src/) |
| 按功能含义选择图标 | [图标指南](icons/README.md) |
| 为当前任务选对组件 | [组件指南](components/README.md) |
| 组织内容浏览、AI 分工与关键决策 | [交互模式](patterns/README.md) |
| 搭建导航、对话和多页签工作区 | [页面模板](templates/README.md) |

让 AI 也用同一套设计语言：[Agent 使用说明](SKILL.md)。

## 开源

[MIT](LICENSE) · [更新记录](CHANGELOG.md) · [参与贡献](CONTRIBUTING.md) · [安全报告](SECURITY.md)

使用、修改与分发时保留许可证及 [第三方声明](THIRD_PARTY_NOTICES.md)；复制工具会一并带上所需文件。
