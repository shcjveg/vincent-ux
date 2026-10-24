# vincent-ux

一套面向桌面级 Agent 工作台的独立设计系统，把设计判断、界面实现和自动检查放在同一条链路里。适用于左导航、对话与多页签内容区组合的工具。

系统以**任务清楚、感知省力、行为可预期**为基础原则：让人看懂当前情况、完成关键判断，把上下文整理与执行交给自动规则或 AI。原则向下落实为设计变量、语义图标、CSS／React 组件、交互模式与页面模板；使用方可以按层复制，在自己的项目里维护。

运行 `npm ci`、`npm run showcase`，打开 `http://127.0.0.1:5190/showcase/`。顶部用实际 React 组件演示内容浏览和交互状态，下方是完整外观参考。无构建的 HTML 接入见 `examples/basic.html`。

## 结构

按「设计判断从抽象到具体」分层，每层只依赖它上面的层，同一件事只在一层出现。

| 层 | 目录 | 回答的问题 |
|---|---|---|
| 原则 | `principles/README.md` | 为什么这样设计：信息取舍、感知表达、行为时序三个基础维度；具体规范分视觉、交互、内容与无障碍 |
| 设计变量 | `tokens/` | 用什么值：颜色、面分层、文字、间距、圆角、阴影、动效 |
| 图标 | `icons/` | 这个含义用哪个图标、哪些禁用 |
| 组件 | `components/` | 界面由哪些件组成，从原子到组织；什么情况用哪个见 `components/README.md` |
| 模式 | `patterns/` | 多个组件怎么配合完成一类交互 |
| 模板 | `templates/` | 一个应用、一个页面的骨架；什么页面用哪个见 `templates/README.md` |

## 收什么、不收什么

只收**换一个同类产品也用得上**的设计信息。判断标准：去掉具体产品的名字和数据，这条规则还成立。

| 收 | 不收（留在产品自己的需求文档和代码里） |
|---|---|
| 颜色、层级、文字、动效这类视觉与交互规则 | 某个产品的功能流程、页面清单、默认数据 |
| 组件的结构、状态和用法 | 某个页面的布局细节、文案、一次性修补 |
| 人与 AI 分工、导航组织这类跨产品的交互模式 | 某个功能怎么用（比如「应用搭建」的分支与发版流程） |
| 能机器判断的规则检查（`scripts/audit.js`） | 产品的验收用例 |

同一条规则只在一层写一次，其他地方引用；颜色语义只在 `principles/visual.md`。

工具与文档另放：`scripts/`（生成与检查）、`showcase/`（展示页）、`SKILL.md`（给 agent 的使用说明）、`CHANGELOG.md`（版本记录）、`REQUIREMENTS.md`（公开设计目标与验收标准）。

## 常用命令

```bash
npm ci             # 按锁文件安装已验证依赖（Node 22.12+）
npm run build      # 由 tokens/src 生成 tokens/dist，并刷新各文件的来源标记
npm run icons -- <含 lucide-react 的 node_modules 目录>   # 生成 icons/dist/sprite.svg
npm run check      # 裸色值、禁用图标、间距刻度、浅色与暗色对照的对比度；给目录参数时检查使用方
npm run sync -- <目录>   # 拷到使用方项目
npm run showcase   # 本地打开展示页
npm run typecheck  # React 与示例的类型检查
npm test           # 工具回归 + Chrome 交互与 axe 扫描
npm run build:showcase # 验证展示页生产构建
```

## 怎么用

`node scripts/sync.mjs <你项目里的目录>` 拷齐设计变量、CSS、React 组件、图标、HTML 示例和规则检查。入口是输出目录的 `styles.css`，可直接用 `<link rel="stylesheet" href="./styles.css">` 或在构建入口 import。

默认只补缺失文件，已有同名文件内容不同时会列出冲突并停止整个写入；先用 `--dry-run` 看计划，确认要替换时加 `--overwrite`，纯 HTML 项目加 `--no-react`。使用方自己的改动由使用方决定怎么合并，不生成同步状态库。

React 接入通过 `components/react/index.ts` 按需导入；依赖版本和锁文件在 `package.json` / `package-lock.json`。当前验证 React 19.3.1、Base UI 1.9.0、Lucide React 1.61.0，浏览器测试使用本机 Chrome。纯 CSS 只提供外观；模态、页签、下拉等行为要用 React 组件或由使用方实现。

挑需要的部分拷进自己的项目即可，拷进去就归你的项目所有，可以按 MIT 许可证修改和分发；复制时一并保留许可证和第三方声明。层与层之间是单向依赖，所以可以只拷设计变量，也可以拷到组件或模板为止：

| 想要的 | 至少拷 |
|---|---|
| 只要配色和面分层 | `tokens/dist/` |
| 要组件外观（纯 HTML 也能用） | `tokens/dist/` + `components/css/` + `icons/dist/sprite.svg` |
| 要 React 交互组件 | 上面两项 + `components/react/` |
| 要整个应用骨架 | 以上全部 + `templates/` |

拷的时候在你的项目里留一份记录，说明拷了什么、来自哪个版本，见下一节。

## 溯源

设计系统只负责让每次拷贝都能查到来源，不规定使用方怎么同步、要不要升级。

- 正式发布时在 git 里创建标签 `vX.Y.Z`，`CHANGELOG.md` 写明改了什么。
- 每个可拷贝的文件开头有一行来源标记，例如 `/* vincent-ux v1.0.0 · tokens/dist/tokens.css */`。文件被拷到哪里，这一行都跟着走。
- 想知道某个项目用的是哪一版：在项目里搜 `vincent-ux v`。想知道某一版改了什么：看 `CHANGELOG.md`，或用 `git diff` 比较两个已发布标签。

首个公开版本为 v1.3.0。公开 Git 历史从经过脱敏的快照开始；早期演进摘要保留在 `CHANGELOG.md`，v1.0.0～v1.2.0 无公开标签。

版本号按语义化规则递增：改名、删除、改变含义升主版本；新增升次版本；修值、修样式升修订号。

## 验证边界

`check` 检查变量、图标、刻度和主题对比度；`audit.js` 检查运行时可自动判断的设计规则；浏览器测试覆盖搜索筛选、分页、选择、表单、浮层、页签、导览及浅深主题。自动检查通过不等于完整无障碍认证，接入后仍需检查实际内容、键盘全流程、读屏和缩放。

Token 源为项目内部的 DTCG 风格格式，由自带脚本解析，不声明可直接导入所有 DTCG 工具。改源文件后运行 build，不手改 dist。

## 开源与贡献

本项目采用 [MIT 许可证](LICENSE)。离线图标精灵包含 Lucide／Feather 派生图标，声明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)；`sync` 会同时复制所需许可证。

贡献流程和检查命令见 [CONTRIBUTING.md](CONTRIBUTING.md)。展示页使用虚构的身份、平台、商品和经营指标，仅用于设计演示。隐私检查范围和安全报告方式见 [SECURITY.md](SECURITY.md)。当前通过 GitHub 源码分发，`private: true` 用于防止误发到 npm，不影响开源使用。
