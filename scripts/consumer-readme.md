# 在项目中使用 Vincent UX v{{version}}

在[设计要求与验收](./guide.html)中搜索设计问题，例如「对齐」或「部分失败」。每项有可用于自己项目的验收方法。要实际操作，可从对应示例进入，例如用[批量改交期](./example-batch/index.html)核对失败后的重试范围。设计评审和 AI 可在仓库里读[同一份索引](./docs/tasks.md)。把索引和[AI 使用说明](./SKILL.md)的路径写进宿主现有的开发说明，就能在下次改界面时找到它们。

| 要做什么 | 从哪里开始 |
|---|---|
| 搭一个整页工作台 | 引入 `styles.css`，在页面根元素选择 `data-palette`，需要固定明暗时设置 `data-theme`。 |
| 给已有页面加一个模块 | 引入 `embedded.css`，在 `<section class="vx-theme" data-palette="cream-ember">` 内添加内容。React 使用 `ThemeScope`，菜单和弹窗自动沿用该模块的主题。 |
| 沿用已有组件，只统一视觉 | 引入 `tokens.css`，从 [主题目录](./palettes.json) 选配色。正文、辅助文字用 `--vx-text-secondary`、`--vx-text-tertiary`，主按钮同时取 `--vx-action-fill` 与 `--vx-action-text`。 |

纯 HTML 的[内容库示例](./example.html)演示筛选、空结果和恢复。

## 使用 React

默认同步附带 `react/index.ts` 和 `example-react/main.tsx`。纯 HTML 副本升级时沿用原模式，添加 React 时在同步命令后指定 `--react`。在支持 TSX 和自动 JSX 转换的宿主中安装本版依赖。

```bash
npm install {{dependencies}}
```

假设本目录位于 `src/vincent-ux/`，在相邻的 `src/App.tsx` 中可以这样嵌入内容。

```tsx
import './vincent-ux/embedded.css'
import { Button, ThemeScope } from './vincent-ux/react'

export function ExportPanel({ onExport }: { onExport: () => void }) {
  return <ThemeScope palette="cream-ember">
    <Button variant="primary" onClick={onExport}>导出当前明细</Button>
  </ThemeScope>
}
```

业务项目提供对象、权限及读写服务。设置可把保存函数交给 `useDraftForm`，成功后读取 `saved`。报表把加载函数交给 `useAppliedQuery`，列表和导出都从 `result.scope` 和 `result.data` 取值。消息流使用 `ChatTranscript`，阅读位置按会话保存。

## 验收和更新

用本项目的一条真实任务检验三件事。把模块缩到侧栏宽度，检查能否完成同一操作。并排放入长标题、缺省说明和异常记录，检查能否沿同一位置比较。让一次保存失败，核对草稿能否恢复；或让一次查询失败，改选条件后重试，核对结果与导出指向哪次查询。

在宿主的 CI 中运行 `node src/vincent-ux/tools/check.mjs src`。按副本所在位置调整路径。该命令使用本版规则，发现错误时返回非零退出码。在产品浏览器测试中加载 `audit.js` 后可对 `window.vxAudit()` 的结果做断言。[项目验收与升级](./docs/usage.md#升级已有副本)

保留 `vincent-ux.lock.json`，与副本一起提交到产品的版本控制。升级前在新版设计系统仓库运行 `npm run sync -- <原目标目录> --dry-run`，确认自动更新、保留定制、删除及冲突清单。随附的[使用许可](./LICENSE)和[第三方声明](./THIRD_PARTY_NOTICES.md)随资源保留。
