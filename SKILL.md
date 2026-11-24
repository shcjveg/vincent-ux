---
name: vincent-ux
description: 按 vincent-ux 设计系统写界面。生成或修改桌面 agent 工作台类页面（左导航、对话、多页签渲染区）、数据与运营工作台页面时使用；用户提到 vincent-ux、设计系统、按规范出页面时使用。
---

<!-- vincent-ux v1.9.0 · SKILL.md -->

# 用 vincent-ux 写界面

先确认入口。含 `vincent-ux.lock.json` 的目录是使用项目的版本化副本；含 `scripts/sync.mjs` 的目录是完整设计系统仓库。

1. 从[设计要求与验收](docs/tasks.md)查找本次涉及的设计问题。将验收方法用在当前项目的对象和数据上，需要实现对照时再打开对应示例。用[基础原则](principles/README.md)解决冲突，从[组件指南](components/README.md)找已有交互。没有专用组件时先组合公开控件和语义变量，用真实对象、失败路径、窄容器与键盘检验。
2. 在副本中读根目录 `README.md` 接入样式与代码。将产品专属对象、权限和服务放在副本外。在产品源码上运行 `node <副本>/tools/check.mjs <产品源码>`，在浏览器测试中加载副本根目录的 `audit.js`。用规范索引中的验收方法核对实际数据、焦点和结果。
3. 升级时按[升级已有副本](docs/usage.md#升级已有副本)预览三方差异。源码仓库提供同步命令，产品的同步清单记录采用的版本和范围。
4. 回补跨项目规则时，按[贡献指南](CONTRIBUTING.md)修改规范原文、案例和回归，并更新设计主题的索引。在完整仓库运行构建、规则与指南检查、类型检查、浏览器测试和展示页构建。

## 关键规范速查

新增的核心规范位置，遇到相关问题时优先查阅：

**Motion & 动效**（`principles/interaction.md#motion-tokens-系统`）
- 时长 token：fast 120ms / base 180ms / slow 280ms
- 缓动曲线：standard (ease) / out (ease-out)
- 循环动效白名单：Spinner / 运行呼吸 / 完成弹跳
- Reduced Motion 处理规则

**组件完整状态**（`components/README.md`）
- Button 6 状态矩阵：默认/悬停/按下/聚焦/禁用/加载
- Input 7 状态矩阵：默认/悬停/聚焦/有值/placeholder/错误/禁用
- 实现细节与 4 条禁止事项

**语义色使用**（`principles/visual.md#语义色消费者登记`）
- brand-accent 合法场景：金额高亮/选中状态/当前步骤/数据高亮
- brand-critical 合法场景：红点/财务负面/阻断/时限/危险操作
- 新场景需先登记

**例外登记**（`principles/visual.md#例外登记`）
- 渐变例外：墨金主按钮/数据可视化淡化
- 装饰动效例外：完成弹跳
- 固有颜色例外：品牌标识/用户上传/平台语义色
- 文字层级禁用规则：禁止 opacity 调淡，必须用语义 token
