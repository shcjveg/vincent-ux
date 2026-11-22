# 参与贡献

先阅读 `principles/README.md` 和 `README.md` 的设计理念。问题与建议通过 GitHub Issues 提交；代码与文档改动通过 Pull Request 提交。

用 Node.js 24 安装并验证：

```bash
npm ci
npx playwright install chrome
npm run build
npm run check
npm run check:guide
npm run check:privacy
npm run typecheck
npm test
npm run build:showcase
```

本地浏览器测试使用 Chrome；Linux 首次安装可用 `npx playwright install --with-deps chrome`。CI 使用当前 Playwright 版本固定的 Chromium headless shell：`npx playwright install --with-deps --only-shell chromium`，再以 `CI=1 npm test` 运行同一套用例。本地展示命令和地址见 `README.md`。

## 从一个案例改进系统

先写清用户要完成什么、在哪里受阻、怎样知道已经解决。业务对象、权限和服务留在产品里。已有控件能够组合完成的，先补模式和一个可操作的案例。多个任务共享同一种行为时，再提取公共组件或修改原有接口。[批量改交期](examples/batch/index.html)演示了用已有控件表达确认范围和逐项重试。[组合规则](patterns/browse.md#批量提交的逐项结果)

修订原则时，修改其所属规范的原文，并对照至少一个已有场景检查新的表述是否仍然成立。用[任务索引](docs/tasks.md)把判断依据、案例和验收动作连起来。可自动观察的关键行为链接相应用例，需要使用者判断的内容写在验收栏。新增 React 组件从 `components/react/index.ts` 导出，在组件指南写明用法。独立示例的文件列入 `scripts/distribution.mjs`，构建入口列入 `vite.config.ts`。运行 `npm run check:guide` 核对链接和回归入口。影响已有用法时，在更新记录说明旧项目要改哪里、升级后怎样验收。

修改变量源后重新生成 `tokens/dist/`，修改图标映射后重新生成精灵图，并提交生成结果。更新版本时同步 `package.json`、锁文件、来源标记和 `CHANGELOG.md`。

示例使用虚构身份、平台、商品和数字。提交前检查 diff 与新增文件；把凭据、本机配置、客户资料、内部链接和会话记录留在仓库之外。`check:privacy` 只提供自动规则筛查，人工检查仍然必要。建议为 Git 提交配置 GitHub 提供的隐私邮箱。
