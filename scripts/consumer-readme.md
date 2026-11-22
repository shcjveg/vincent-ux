# 在项目中使用 Vincent UX v{{version}}

先试一项任务。用项目的本地服务打开[内容库示例](./example.html)，按「访谈」筛选，再清除条件。这里的路径都相对当前副本。

| 要做什么 | 从哪里开始 |
|---|---|
| 搭一个整页工作台 | 引入 `styles.css`，在页面根元素选择 `data-palette`，需要固定明暗时设置 `data-theme`。 |
| 给已有页面加一个模块 | 引入 `embedded.css`，在 `<section class="vx-theme" data-palette="cream-ember">` 内添加内容。React 使用 `ThemeScope`，菜单和弹窗自动沿用该模块的主题。 |
| 沿用已有组件，只统一视觉 | 引入 `tokens.css`，从 [主题目录](./palettes.json) 选配色。正文、辅助文字用 `--vx-text-secondary`、`--vx-text-tertiary`，主按钮同时取 `--vx-action-fill` 与 `--vx-action-text`。 |

## 使用 React

默认同步附带 `react/index.ts` 和 `example-react/main.tsx`。只复制过 HTML 的项目可用原目标目录再次执行默认同步，补齐 React 文件。在支持 TSX 和自动 JSX 转换的宿主中安装本版依赖。

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

升级前在设计系统仓库运行 `npm run sync -- <原目标目录> --dry-run`。默认同步保留有差异的文件并报告冲突。业务页面、服务和自定义组件放在副本旁边，便于比较版本。同步后从设计系统仓库运行 `npm run check -- <产品源码目录>`，再执行本项目的构建与测试。随附的[使用许可](./LICENSE)和[第三方声明](./THIRD_PARTY_NOTICES.md)应随资源保留。
