# 按任务做设计

设计前先写出用户要对哪个对象做什么、怎样才算完成。找到相近的任务后，读对应原则和模式，打开案例，用自己的数据完成验收。[基础原则与冲突取舍](../principles/README.md) · [完整模式目录](../patterns/README.md) · [系统覆盖表](coverage.md)

| 任务 | 判断依据与组合方式 | 案例 | 在页面怎样验收 | 回归 |
|---|---|---|---|---|
| 给一项关键操作选择按钮底色、配文和图标颜色 | [区分品牌、动作和状态](../principles/visual.md#颜色只表达意义) · [用同一组变量组合按钮底色、文字与边界](usage.md#从三种品牌色接入) | [配色与主操作对照](../showcase/index.html#palettes) | 选一组品牌色，切换明暗，核对按钮上的文字与图标，悬停后仍然可读。 | [各主题的局部色卡和整页主按钮在两种明暗下使用同一组外观](../tests/design-principles.spec.ts) |
| 给没有专用组件的批量修改设计确认与重试 | [保留失败操作的输入](../principles/interaction.md#请求与恢复) · [按逐笔结果限定重试范围](../patterns/browse.md#批量提交的逐项结果) | [批量改交期](../examples/batch/index.html) | 让两笔订单中一笔失败，核对原日期、成功数量与重试对象。 | [部分成功后只重试失败订单](../tests/batch.spec.ts) |
| 从筛选结果交接一份报表 | [区分编辑和生效](../principles/interaction.md#操作何时生效) · [明细和导出使用同一份查询范围](../patterns/browse.md#已应用的查询范围) | [地区明细与导出](../showcase/index.html#report) | 改条件时保留原结果。下钻后导出，逐条核对地区和城市。 | [新查询先完成时，晚到的旧响应无法改写结果](../tests/design-principles.spec.ts) |
| 在现有产品里编辑一项设置 | [让等待和失败可见](../principles/interaction.md#每个组件都有完整状态) · [保存失败保留原草稿](usage.md#保存与重试) | [嵌入式项目偏好](../examples/embedded/index.html) | 让保存失败，保留草稿。重试成功后刷新，读回已保存的名称。 | [独立项目只依赖同步产物，整页与嵌入两种接入都能完成任务](../tests/consumer.spec.ts) |
| 在窄侧栏里完成同一个任务 | [可达性](../principles/accessibility.md) · [缩窄后仍可完成主任务](../patterns/page-composition.md#跨端保留任务) | [登录门户](../showcase/index.html#portal) | 把入口放进窄侧栏，键盘触发校验、修正输入，再完成登录。 | [桌面里的窄模块各按自己的宽度重排，同一登录任务可完成](../tests/system-contracts.spec.ts) |
| 在持续输出时回看旧消息 | [行为可预期](../principles/README.md#把原则用在新页面上) · [回读时保留当前位置](../patterns/page-chat-flow.md#持续输出与回读) | [会话工作区](../showcase/index.html#session-workspace) | 生成期间向上翻，等到下一段出现，再主动跳至最新。 | [分段回复跟随底部，回读与切换会话保留位置，读者可主动返回](../tests/design-principles.spec.ts) |
| 让长短不齐的对象仍可比较 | [把相同字段放在相同位置](../principles/visual.md#强调与比较) · [页面阅读顺序](../patterns/page-composition.md#一个阅读顺序) | [集合与视图切换](../showcase/index.html#browse) | 并排放入长标题、短标题与缺摘要的记录，按同一位置查找状态与日期。 | [长短和缺省摘要保留可比较的对象、状态和时间](../tests/design-principles.spec.ts) |

## 找不到相近任务时

把业务对象、权限和写入服务留给产品。先用已有语义变量和控件拼出能操作的最小流程，再核对三个问题。

1. 用户能否在桌面、窄容器和键盘上找到同一个对象并完成操作？
2. 放入长标题、缺省值和异常记录后，仍能比较哪些字段，读出哪个动作最重要？
3. 用户能否先说出这次操作何时生效、影响谁？让一次提交失败，检查重试范围、输入、焦点及返回位置。

例如改交期需要订单号、原日期、新日期和确认范围。提交前让用户核对范围，收到逐笔回执后展示哪些成功、哪些可以重试。保留业务自己的组件，提取其他场景也需要的选择、确认与逐项结果约定。[批量操作模式](../patterns/browse.md#批量提交的逐项结果)

## 将原则放进产品验收

将副本的静态检查接入产品 CI，给重要任务写一条实际用户路径的浏览器测试。在页面加载随副本提供的 `audit.js`，用 `window.vxAudit()` 获取可定位到元素的发现。页面规则与服务端结果各自验收。评审时请使用者在执行前预测影响范围，再用操作结果核对。[无障碍底线](../principles/accessibility.md) · [贡献案例](../CONTRIBUTING.md)
