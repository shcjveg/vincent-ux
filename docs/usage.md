# 接入 Vincent-UX

支持纯 HTML／CSS 和 React。你可以复制整套界面资源，也可以只取用设计变量、组件或工作台骨架；复制后的代码由你的项目维护。

## 按产品边界接入

| 产品负责什么 | 设计系统提供什么 | 验收动作 |
|---|---|---|
| 宿主决定哪些区域采用 Vincent UX | 整页用 `styles.css`。已有产品里的局部功能用 `embedded.css` 与 `ThemeScope` | 在模块内切换明暗，打开下拉或弹窗，观察弹层和宿主页 |
| 品牌决定配色与需要强调的动作 | 主题为页面、文字、链接、操作和业务状态分配颜色，组件从语义变量取值 | 在同一主题里核对正文、主按钮、图标、悬停和等待状态 |
| 业务定义字段、校验、权限及保存服务 | `useDraftForm` 管理编辑中的值、已保存值、提交与重试。按钮、字段和对话框负责各自的交互 | 让一次保存失败，再次提交，核对输入、已保存标题和刷新后的结果 |
| 产品决定列表的数据范围与可执行动作 | `Collection`、`SelectionBar`、`Dialog` 等提供列表、选择和详情的交互结构 | 勾选后缩小筛选范围，核对批量操作的数量与实际记录 |

设计原则的归属取决于谁能保证它成立。多个产品都需要的角色放进变量，跨页反复出现的操作时序放进公共模块。产品提供领域数据和副作用，展示页和接入示例都从公开入口调用。[视觉与交互原则](../principles/README.md) · [浏览与选择](../patterns/browse.md)

## 按可用空间与数据范围接入

- 字号使用 `font-size-*`，默认根字号 16px 时正文 13px、辅助文字 12px。宿主调整根字号后，两者与标准输入、按钮同步增长。卡片用 `<SectionCard title="项目概况" headingLevel={2}>` 接入文档大纲，外观沿用卡片标题。
- `.vx-grid--2/3/4` 的数字是最多列数。栅格、`FilterBar` 和门户都能在桌面侧栏里重排。完整工作区将 `useWorkspaceLayout(navigationExpanded)` 返回的 `ref` 挂在 `.vx-app`，将 `drawerNavigation`、`overlayChat` 用于选择 `WorkspaceOverlay` 的呈现方式。
- 有提交成本的查询用 `useAppliedQuery(load)`。调用 `run(scope)` 时传入可用 `structuredClone` 复制的条件。加载函数接收这份条件与 `AbortSignal`。标题、明细与导出读取同一个 `result.scope` 和 `result.data`。失败后 `retry()` 使用 `failure.scope`，后来发出的查询优先。
- 批量操作可能移走原入口时，给 `SelectionBar` 传入指向可聚焦结果区的 `fallbackFocus`。独立的图标操作使用系统控件；图形大小与操作区域可分别调整。

[工作区示例](../showcase/WorkspaceDemo.tsx) · [查询示例](../showcase/ReportExample.tsx) · [系统核验表](coverage.md#按系统层核验)

## 复制到项目

先按 [首页](../README.md#快速体验) 下载并安装设计系统，再在设计系统仓库目录执行：

```bash
npm run sync -- ../my-app/src/vincent-ux
```

副本根目录的 `README.md` 写明版本、依赖与样式入口。设计时从 `guide.html` 或[任务索引](tasks.md)选择要做的事。每项任务关联原则、可操作案例和验收动作。已有项目可以在自己的开发说明中链接这份索引，让设计师和 AI 使用同一版本。

整页使用 `styles.css`。嵌入已有页面的模块使用 `embedded.css`，在[嵌入示例](../examples/embedded/index.html)里切换模块明暗，检查宿主页面仍保留自己的样式。

首次接入默认包含 HTML 与 React。纯 HTML 项目在命令后加 `--no-react`，后续需要 React 时加 `--react`。把副本和其中的 `vincent-ux.lock.json` 一起提交，产品自己的页面与服务放在相邻目录。

## 升级已有副本

在**新版设计系统仓库**运行以下命令。先阅读[更新记录](../CHANGELOG.md)，特别留意会改变宿主调用、键盘操作或可访问性角色的条目。

```bash
npm run sync -- ../my-app/src/vincent-ux --dry-run
npm run sync -- ../my-app/src/vincent-ux
```

有清单时，工具用上次同步的原件比较新版和项目里的文件。仅上游修改的文件会更新，上游移除且本地未改的文件会删除。仅项目修改的内容会保留，项目自行添加的文件也会保留。两边都改动同一文件时，预览列出「冲突」，整批等待处理。HTML／React 模式沿用上次选择。

**首次升级 v1.7 及以前的同步副本**需要一份原版作比较。例如，项目原先从 v1.6.0 以纯 HTML 方式接入，在新版仓库旁用该标签生成干净副本，再执行升级。

```bash
git worktree add --detach ../vx-old v1.6.0
node ../vx-old/scripts/sync.mjs ../vx-old-copy --no-react
npm run sync -- ../my-app/src/vincent-ux --base ../vx-old-copy --dry-run
npm run sync -- ../my-app/src/vincent-ux --base ../vx-old-copy
```

换成项目实际采用的标签。原项目带 React 时，生成原版副本的命令省去 `--no-react`。也可解压同版源码，在空目录生成这份副本。首次成功升级后，后续可以直接运行本节开头的预览和同步命令。手工摘取了个别文件的项目，可先把新版同步到空目录，对照迁移自己采用的部分。

**遇到冲突时**，把新版同步到另一个空目录，与项目文件比较，在项目文件中完成合并。在原升级命令后追加 `--keep-local css/atoms.css`，表示这个路径已处理，可重复指定。清单会记录新版原件，下一次升级仍能识别本地定制。`--overwrite` 会选择整批上游内容，包括存在本地定制的受管文件。升级后在宿主运行静态检查，用真实数据重走受影响的任务。

## React

组件以 TypeScript／TSX 源码提供，适合接入支持 TSX、自动 JSX 转换（TypeScript 使用 `jsx: "react-jsx"`）和 CSS 导入的构建环境。本版本使用 React 19；在你的 React 项目中安装配套依赖：

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

升级到 v1.7 时，按可访问性角色定位日期比较选项的调用方应改用 `checkbox`。原有 `DateFilter` 参数与「应用」回调继续可用。需要持续追加回复的对话，可从同一 React 入口导入 `ChatTranscript` 和 `ChatReadingPosition`，由会话持有阅读位置。[持续输出与回读](../patterns/page-chat-flow.md#持续输出与回读)

### 在已有产品里嵌入一个模块

同步后引入 `./vincent-ux/embedded.css`，用 `ThemeScope` 包住模块。嵌入入口通过 CSS `@scope` 限定重置、排版和组件选择器。将卡片、表单等视觉组件放在作用域容器里面。局部主题可以嵌套。菜单、提示和模态弹窗挂在最近的 React 主题容器内。全屏弹窗需要显示到页面边缘时，将容器放在不会裁剪或变换弹窗的宿主节点上。

```tsx
import './vincent-ux/embedded.css'
import { Button, ThemeScope } from './vincent-ux/react'

<ThemeScope palette="cream-ember">
  <Button variant="primary" onClick={openEditor}>编辑名称</Button>
</ThemeScope>
```

`palette` 对应同步产物 `palettes.json` 中的 `id`。独立嵌入入口默认跟随系统明暗，嵌套模块继承上层选择。模块中的 `ThemeToggle` 只更新当前模块。宿主也可传入 `mode` 和 `onModeChange` 自行管理偏好。纯 HTML 用 `<section class="vx-theme" data-palette="cream-ember">` 承载同一套样式，将交互弹层挂在该区域内。[可操作的嵌入示例](http://127.0.0.1:5190/examples/embedded/) · [完整 React 源码](../examples/embedded/main.tsx)

### 保存与重试

`useDraftForm(initial, persist)` 在表单挂载时读取初值。`draft` 用于输入框，`saved` 用于已生效的标题或导出。用 `edit` 替换草稿，`discard` 恢复最近一次成功值。校验通过后调用 `await submit()`，成功返回 `true`，保存失败时返回 `false` 并在 `error` 中提供原因。等待回执时重复提交也返回 `false`。以 `status === 'saving'` 驱动按钮等待态。切换到另一个业务对象时，用该对象的 ID 作为表单组件的 React key。

`persist` 由项目实现，可以写浏览器偏好，也可以等待服务端确认。提交使用当时的快照，失败保留草稿，成功仅更新已保存值。即时生效的偏好可以直接更新所在主题。[设置表单](../showcase/SettingsExample.tsx) · [独立接入回归](../tests/consumer.spec.ts)

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

在根元素上设置 `data-palette="主题 id"` 切换配色，默认使用墨金。22 套主题共用一个选择器。打开本地展示页的「颜色 → 配色主题」，先比较同一张卡里的页面、正文和主按钮，再应用到整页。切换明暗可继续比较同一任务。[主题预览](http://127.0.0.1:5190/showcase/#palettes)

### 从三种品牌色接入

在主题源文件的 `swatches` 中填写两种基础色和一种动作强调色。两种基础色给承载面和内容定调。动作强调色提供按钮的色相，构建脚本按明暗分别生成填充、悬停填充、低彩度文字和必要的细边界。例如选择「奶油焦橙」，浅色门户用深焦橙按钮配暖白字，暗色门户用浅橙按钮配深色字。[配色源文件](../tokens/src/palettes.json) · [奶油焦橙门户](http://127.0.0.1:5190/showcase/?palette=cream-ember#portal)

在页面使用 `Button variant="primary"` 或 `.vx-btn--primary`。已有形状的自定义主操作控件可以加 `.vx-action`，一起取得 `action-fill`、`action-fill-hover`、`action-text` 和 `action-edge`。图标继承文字颜色。反色横幅在局部提供整组颜色。新增主题后运行 `npm run build` 和 `npm run check`，再用键盘试一次选中、提交和等待反馈。[颜色规则](../principles/visual.md#颜色只表达意义)

配色参考包括产品调性分类，以及 Leo 边减边设计《高级感网站配色》三条视频中的 12 组原色。[分类研究](research/color-theme-taxonomy.md) · [原色记录](../tokens/src/palettes.json)

接入文字时，标题用 `.vx-title`，段落用 `.vx-body`，日期或来源用 `.vx-meta`。行内链接使用原生 `a`，按钮形态的文字链接使用 `.vx-link`。这些角色会随主题和明暗切换。比如「奶油焦橙」在浅色模式下使用墨黑标题、暖灰正文和较深的橙色链接，焦橙保留给主按钮。[预览同一段文字](http://127.0.0.1:5190/showcase/?palette=cream-ember#text-colors) · [文字用色规则](../principles/visual.md#文字三级)

设计变量由仓库自带脚本解析，接入时使用生成的 CSS；变量含义与视觉约定见 [视觉原则](../principles/visual.md)。

## 检查与更新

在使用项目的根目录运行随副本交付的检查器。它只需要 Node.js，可把同一条命令放进产品 CI。

```bash
node src/vincent-ux/tools/check.mjs src
```

检查使用该副本的变量、间距与图标规则，错误会返回非零退出码。加载 `audit.js` 后在页面调用 `window.vxAudit()`，可进一步定位运行时问题。用户能否预判影响范围、重试是否保住输入、导出对象是否正确，需要在产品的实际流程中验证。[任务验收](tasks.md) · [覆盖表](coverage.md)
