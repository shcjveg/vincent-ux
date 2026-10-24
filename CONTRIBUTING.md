# 参与贡献

先阅读 `principles/README.md` 和 `README.md` 的设计理念。问题与建议通过 GitHub Issues 提交；代码与文档改动通过 Pull Request 提交。

用 Node.js 24 安装并验证：

```bash
npm ci
npx playwright install chrome
npm run build
npm run icons -- node_modules
npm run check
npm run check:privacy
npm run typecheck
npm test
npm run build:showcase
```

浏览器测试使用 Chrome；Linux 首次安装可用 `npx playwright install --with-deps chrome`。本地展示命令和地址见 `README.md`。

原则、变量、组件、模式和模板各自维护自己的规则；先把问题放回真实页面验证，再提炼可复用部分。新增组件应包含必要状态、键盘行为与展示示例；行为变更补对应回归。修改变量源后重新生成 `tokens/dist/`，修改图标映射后重新生成精灵图，并提交生成结果。更新版本时同步 `package.json`、锁文件、来源标记和 `CHANGELOG.md`。

示例使用虚构身份、平台、商品和数字。提交前检查 diff 与新增文件；把凭据、本机配置、客户资料、内部链接和会话记录留在仓库之外。`check:privacy` 只提供自动规则筛查，人工检查仍然必要。建议为 Git 提交配置 GitHub 提供的隐私邮箱。
