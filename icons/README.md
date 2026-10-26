<!-- vincent-ux v1.4.2 · icons/README.md -->

# 图标

图标层只回答一件事：这个含义用哪个图标。含义对照表在 `icons.json`，底层图标库是 [lucide](https://lucide.dev)。

- **按含义引用**：React 项目用 `components/react/Icon.tsx` 的 `<Icon name="chat" />`；纯 HTML 页面用生成的 `icons/dist/sprite.svg#含义名`（同步后为 `icons/sprite.svg#含义名`），例如 `#open-workspace`。
- **新增含义先登记**：表里没有的含义，先加进 `icons.json` 的对应分组（导航、动作、状态），同步更新 React 映射并运行 `npm run build`（含图标生成）后使用；一个含义只对应一个图标，一个图标尽量只表达一个含义。
- **尺寸只有三档**：14、16、18px，对应 `size-icon-sm/md/lg`；线宽统一 1.75。
- **禁用清单**：`forbidden.names` 里的装饰图标任何地方都不用。`npm run check` 会扫描。
