# 接入 Vincent-UX

支持纯 HTML／CSS 和 React。你可以复制整套界面资源，也可以只取用设计变量、组件或工作台骨架；复制后的代码由你的项目维护。

## 复制到项目

先按 [首页](../README.md#快速体验) 下载并安装设计系统，再在设计系统仓库目录执行：

```bash
npm run sync -- ../my-app/src/vincent-ux
```

输出包含样式、React 组件、图标、可运行的 `example.html`、页面审计工具和许可证。

| 需要什么 | 选项 |
|---|---|
| 先预览复制计划 | `--dry-run` |
| 只接入 HTML／CSS | `--no-react` |
| 比较差异后，替换已有文件 | `--overwrite` |

默认补齐缺失文件；已有文件内容不同时，会报告冲突并停止整批写入。重新复制前先比较改动，保留你的产品定制。

## React

组件以 TypeScript／TSX 源码提供，适合接入支持 TSX 和 CSS 导入的构建环境。本版本使用 React 19；在你的 React 项目中安装配套依赖：

```bash
npm install react@19.3.1 react-dom@19.3.1 @base-ui/react@1.9.0 lucide-react@1.61.0
```

在 `src/App.tsx` 中使用：

```tsx
import './vincent-ux/styles.css'
import { Button } from './vincent-ux/react'

export default function App() {
  return <Button variant="primary">开始处理</Button>
}
```

搜索、表单、下拉、弹层、页签、导览等用法见 [组件指南](../components/README.md#react-接入约定)。

## HTML／CSS

复制时加 `--no-react`，在页面中引入样式：

```html
<link rel="stylesheet" href="./vincent-ux/styles.css" />
<button class="vx-btn vx-btn--primary">开始处理</button>
```

打开输出目录的 `example.html` 查看完整示例。CSS 提供外观；弹层、页签等交互使用 React 组件，或由你的应用实现键盘操作、焦点和语义。

## 只取用一部分

| 你需要 | 取用这些资源 |
|---|---|
| 配色、文字与间距 | `tokens/dist/tokens.css` |
| 组件外观 | 上一项 + `components/css/` + `icons/dist/sprite.svg` |
| React 交互 | 上一项 + `components/react/` 及配套依赖 |
| 工作台骨架 | 上一项 + `templates/css/`，参考 [模板指南](../templates/README.md) |

手动复制时同样保留 `LICENSE`、`THIRD_PARTY_NOTICES.md` 与 `licenses/lucide.txt`。按需引入 CSS 时，先加载设计变量，再加载组件，最后加载模板；完整接入可直接使用 `styles.css`。

## 配色与主题

默认主题跟随系统；在根元素上设置 `data-theme="light"` 或 `data-theme="dark"` 可手动切换。要让用户自己切换，放一个 [`ThemeToggle`](../components/README.md)（React）：左下角最底的小圆钮，记住用户的选择；根元素上写的 `data-theme` 作为没选过时的默认值，适合嵌入固定浅色宿主的页面。

配色主题与明暗相互独立：在根元素上设置 `data-palette="主题 id"` 切换，不设置即为默认的墨金。10 套主题按暖冷、软硬、清浊三条轴各占一个位置，只换颜色，不换圆角、字体和间距。按产品的调性挑选，场景和人群只作参考：

| id | 名称 | 位置（暖冷 · 软硬 · 清浊） | 适合 |
|---|---|---|---|
| （默认）`ink-gold` | 墨金 | 暖 · 中偏硬 · 浊 | 经营看板、财务与结算、桌面工作台 |
| `scholar` | 书卷 | 暖底冷字 · 中 · 浊 | 教育、研究报告、知识库、长文阅读 |
| `mono` | 素白 | 中 · 中偏硬 · 无彩 | 工具与后台、文档、作品集与画廊、媒体内容展示 |
| `signal` | 信号 | 冷 · 硬 · 清 | 开发者工具、数据与 AI 平台、监控 |
| `mist` | 晴雾 | 冷 · 软 · 中 | 医疗、金融服务、保险、客服 |
| `grove` | 松林 | 中偏冷 · 软 · 浊 | 健康、母婴、生活方式、可持续 |
| `spark` | 珊瑚 | 暖 · 中 · 清 | 营销活动、增长与投放复盘、对客展示 |
| `blush` | 柔雾 | 暖 · 软 · 中 | 美妆、母婴、轻社交、生活服务 |
| `aubergine` | 梅子 | 暖冷之间 · 硬 · 浊 | 高端品牌、会员、时尚与奢侈品、对外汇报 |
| `pop` | 霓虹 | 中 · 硬 · 极清 | 潮流与联名、社区、创意活动 |

主题参数在 `tokens/src/palettes.json`：每套只给中性色相与浓淡、强调色色相与彩度、危急色色相，色值由 `npm run build` 从默认配色派生，明度不变，`npm run check` 逐套核对对比度（正文 4.5:1）以及强调色与危急色的色相间隔（≥ 40°）。分类依据见 [配色主题分类调研](research/color-theme-taxonomy.md)。只想换品牌强调色时，在 `palettes.json` 新增一套主题，不要直接改 `brand.tokens.json` 的默认值。

设计变量由仓库自带脚本解析，接入时使用生成的 CSS；变量含义与视觉约定见 [视觉原则](../principles/visual.md)。

## 检查与更新

在设计系统仓库目录检查你的项目：

```bash
npm run check -- ../my-app/src
```

检查覆盖设计变量、图标与间距规则。输出目录的 `audit.js` 可在页面加载后调用 `vxAudit()`，辅助发现运行时设计问题。实际页面还应检查键盘全流程、读屏、缩放以及加载／空／失败状态。会话页签的状态边界见[页面与对话](../patterns/page-chat-flow.md)，近期能力的示例与验证入口见[沉淀覆盖表](coverage.md)。

文件中的 `vincent-ux v…` 标记帮助你识别来源版本。升级前查看 [更新记录](../CHANGELOG.md)，比较新旧文件，按你的项目节奏合并。
