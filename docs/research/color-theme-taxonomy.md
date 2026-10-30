# 色彩主题分类依据调研

> 调研日期 2026-10-28。目的：在给 vincent-ux 增加多套配色主题（只改颜色，不改圆角、字体、间距）之前，先找到有出处的分类维度，再据此决定主题清单。
> 引用规则：每条结论后附来源 URL。标 **[未核实]** 的是没有拿到一手来源的内容，标 **[推断]** 的是本文自己的推导或计算，不是来源原话。

## 0. 结论先行

1. 没有一个现成的、同时覆盖「风格调性 + 使用场景 + 受众」的配色分类体系。能查到一手来源的体系各管一段：
   - 日本色彩设计研究所（NCD）的 Color Image Scale 管**风格调性**（心理学实验得出的三条轴）。
   - 品牌个性研究（Aaker 1997）管**受众与场景**的语义标签。
   - Radix、shadcn、Material 3、Carbon 管**工程结构**，也就是主题在 token 层怎么拆。
2. 推荐的分类基础：**以 Kobayashi/NCD 的三条轴给主题定位，用 Radix/shadcn 的「中性色倾向 × 强调色」拆法落到 token，用 Aaker 五维只做场景/受众标签。** 明暗（Carbon 的做法）是独立于主题的正交轴，不参与分类。
3. 业主给的九个词（学院、营销、媒体、极简、科技、艺术、自然健康、奢尚、潮流）混了三种东西：风格调性、使用场景、载体类型。它们不在同一层，不能直接当主题名（见第 5 节）。
4. 建议首批 6 套核心主题 + 3 套可选主题，见第 4 节。

## 1. 候选体系逐项核查

### 1.1 Kobayashi / NCD「Color Image Scale」

**核实到的事实**

- 作者 Shigenobu Kobayashi，所属 Nippon Color & Design Research Institute（NCD）。1981 年论文摘要：用色彩投影法、方差分析、聚类分析、因子分析和语义差异法建立量表；每个颜色有三个属性 warm/cool、soft/hard、clear/grayish，分别与色相、明度、彩度相关。（Wiley 摘要页，经检索结果核对）https://onlinelibrary.wiley.com/doi/10.1002/col.5080060210
- NCD 官网：基本 Image Scale 是 WARM-COOL、SOFT-HARD、CLEAR-GRAYISH 三轴的立体空间，单色、配色、语言（形容词）都放在里面。WARM-COOL 对应色相，SOFT-HARD 对应色调（tone），CLEAR-GRAYISH 对应清浊。https://ncd-ri.co.jp/service/image-scale/
- 单色部分是 Hue&Tone 系统的 130 色；语言部分是 180 个词；配色部分以三色配色为基本。同上。
- 官网还写了：「左右下方和左上方的空白位置不存在单色」，即颜色在这个空间里不是均匀分布的。同上。
- 轴的来源：用 SD 法测 130 色的印象，因子分析抽出三条轴。https://ncd-ri.co.jp/service/image-scale_select/
- CLEAR-GRAYISH 轴：清色（新绿、青空）一端动态、有对比；浊色（枯叶、阴天）一端沉稳。自然题材的图案落在 GRAYISH 一侧，几何规整的落在 CLEAR 一侧。官方称这条轴对「人的喜好分析、气候风土、质感分析」有效。https://ncd-ri.co.jp/service/clear-grayish/ 、 https://ncd-ri.co.jp/service/image-scale/
- 新版 Image Scale：700 个形容词，16 个分区（zoning）加 40 个「企划概念」关键词分组，配色扩到多色。https://ncd-ri.co.jp/merchandise/new_image_scale/
- 一个独立的同行评议会议论文（Linköping，CGIV 2010）转述：130 基础色 + 1170 组三色配色对应 180 个词；词在二维 KeyWord Image Scale（hard-soft × cool-warm）上聚成 **15 个 Pattern**；另有 **8 个 Lifestyle**（与人的色彩喜好相关，每个由 5–6 个词描述）。表里出现的 Pattern 名有 ELEGANT、ROMANTIC、DYNAMIC、MODERN、CLEAR。https://www.diva-portal.org/smash/get/diva2:325913/FULLTEXT01.pdf

**15 个意象分类的具体名单：只有二手来源**

- 岩手县立大学的讲义（引用 Kobayashi《カラーシステム》，讲谈社）列出：穏やか 6 词（romantic、natural、elegant、chic、classic、dandy）、爽やか 4 词（clear、cool-casual、modern、formal）、華やか 5 词（pretty、casual、dynamic、gorgeous、ethnic），共 15 个；8 个 Lifestyle 为 romantic、natural、elegant、chic、classic、dandy、casual、modern。http://p-www.iwate-pu.ac.jp/~dai/kansei/chapter2.pdf
- 任务说明里的清单有 wild，岩手讲义里是 ethnic。检索到的英文版全文 OCR 摘录里 wild 和 ethnic 都作为词出现，但没有拿到干净的 15 个 Pattern 名单（Internet Archive 仅可借阅）。**15 个名称的权威名单 [未核实]**，本文只用「三轴」和「8 个 Lifestyle」，不依赖那 15 个名字。https://archive.org/details/colorimagescale00koba

**一个 NCD 之外的旁证**

- Ou 等（2004，Color Research & Application）让英国和中国观察者对 20 个颜色评 10 个情绪量表，因子分析得到 activity、weight、heat 三个因子，与 Kobayashi 等人的因子一致。男女无显著差异，但英国与中国观察者在 tense–relaxed 和 like–dislike 上有显著差异。https://onlinelibrary.wiley.com/doi/abs/10.1002/col.20010 （只读到摘要；经检索结果转述）
- 含义：三轴有跨研究的支撑，但**喜好**有文化差异。词的名字（学院、潮流）不能照搬日本语料，轴可以。

**一个 NCD 的局限**

- 官网标明图像受著作权保护，不能直接引用其量表图。我们只能借用轴的概念，不能复制它的分区图。https://ncd-ri.co.jp/service/image-scale/

**对「调性 + 场景 + 受众」的覆盖**

| 目标 | 覆盖程度 |
|---|---|
| 风格调性 | 直接。三轴就是调性的坐标。 |
| 受众 | 部分。Lifestyle 是按人群色彩喜好分的，但 8 类偏日本生活方式。 |
| 场景 | 弱。官网只说可用于产品、命名、促销的一致规划，没有场景分类。 |

### 1.2 Material 3 动态配色 variant

**核实到的事实**

- `Variant` 枚举：MONOCHROME、NEUTRAL、TONAL_SPOT、VIBRANT、EXPRESSIVE、FIDELITY、CONTENT、RAINBOW、FRUIT_SALAD、CMF（共 10 个，比任务里列的多一个 CMF）。https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/dynamiccolor/variant.ts
- 2021 规格里每个 variant 只改**五个调色板的色相与彩度**，源码在 `DynamicSchemePalettesDelegateImpl2021`。https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/dynamiccolor/dynamic_scheme.ts

  | variant | 主色板（HCT 彩度） | 中性色板彩度 | 备注 |
  |---|---|---|---|
  | MONOCHROME | 0 | 0 | 全灰 |
  | NEUTRAL | 12 | 2 | 接近灰 |
  | TONAL_SPOT | 36 | 6 | 默认；低彩度粉彩 |
  | VIBRANT | 200（上限截断） | 10 | 主色板彩度最大 |
  | EXPRESSIVE | 40，色相 +240 | 8，色相 +15 | 主色相与种子色错开 |
  | RAINBOW | 48 | 0 | 种子色相不出现在主题里 |
  | FRUIT_SALAD | 48，色相 −50 | 10 | 同上，更活泼 |
  | FIDELITY / CONTENT | 等于种子色 | 种子彩度 / 8 | 贴合种子色 |

  （表里数值直接读自上面的源码。EXPRESSIVE 的次色、三色按色相分段旋转；VIBRANT 同理。）
- 色调（tone）是固定的：primary 浅色取 tone 40、暗色取 80，MONOCHROME 例外（浅 0、暗 100）；对比度由 ContrastCurve(3, 4.5, 7, 7) 约束，也就是**换 variant 不换明度层级，对比度由算法保证**。https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/dynamiccolor/color_spec_2021.ts
- Flutter 官方文档对 variant 的描述：tonalSpot 是默认、低彩度粉彩；vibrant 是高彩度粉彩；fidelity 贴合种子色；monochrome 无彩度；neutral 近灰；expressive 中彩度且主色相与种子不同。https://api.flutter.dev/flutter/material/DynamicSchemeVariant.html
- m3.material.io 的说明页是前端渲染，本次没能取到文字内容 **[未核实]**，以上以源码和 Flutter API 文档为准。

**它分的是什么**

- 分类维度是**彩度（energy）与色相是否贴合种子**，不是风格。它没有「学院」「科技」这类语义，用户从一个种子色出发，variant 决定整体多鲜艳。
- 对我们有价值的是**结构**：主题 = 少量参数（色相、彩度、中性色彩度）作用在固定的明度阶梯上，对比度因此可控。

### 1.3 Radix Colors / Radix Themes

**核实到的事实**

- 提供一个纯灰 `gray` 加五个带色倾向的灰：mauve（紫）、slate（蓝）、sage（绿）、olive（黄绿）、sand（黄）。https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette
- 官方给了两种搭法：**中性搭配**（要中性感或图省事，gray 配任何色相）；**自然搭配**（选与强调色色相最近的灰，「差异细微，但更有色彩感和和谐感」）。同上。
- 自然搭配的对应表（文档）：mauve ← tomato/red/ruby/crimson/pink/plum/purple/violet；slate ← iris/indigo/blue/sky/cyan；sage ← mint/teal/jade/green；olive ← grass/lime；sand ← yellow/amber/orange/brown。同上。源码 `getMatchingGrayColor` 与之一致（另把 gold、bronze 也归 sand）。https://raw.githubusercontent.com/radix-ui/themes/main/packages/radix-ui-themes/src/helpers/get-matching-gray-color.ts
- Radix Themes 的主题只有两个颜色旋钮：`accentColor`（26 个值）和 `grayColor`（auto + 6 个），`grayColor="auto"` 时按上表配对。https://raw.githubusercontent.com/radix-ui/themes/main/packages/radix-ui-themes/src/props/color.prop.ts 、 https://www.radix-ui.com/themes/docs/theme/color
- 每个色阶 12 级，用途固定（1–2 背景、3–5 组件背景、6–8 边框、9–10 实心、11–12 文字）；第 11、12 级在同色阶第 2 级背景上保证 APCA Lc 60 / Lc 90。https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
- 文档警告：背景用饱和灰时，Badge 等彩色组件在暗色下可能与背景冲突。https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette
- 语义色建议：error 用 red 系，success 用 green 系，warning 用 yellow/amber/orange，info 用 blue/indigo/sky/cyan。同上。

**它分的是什么**

- 维度是**色相家族**（中性倾向 × 强调色），不是风格或场景。它不回答「这是什么气质」，只回答「灰该偏哪边才和这个强调色协调」。
- 对我们最有价值：**中性层的色温是一个独立的、有限的选择（6 个），和强调色配对而不是自由组合。**

### 1.4 shadcn/ui 基础色

**核实到的事实**

- 当前文档：`baseColor` 可选 Neutral、Stone、Zinc、Mauve、Olive、Mist、Taupe。这是安装时的选择，切换需要重装组件。https://ui.shadcn.com/docs/theming
- 任务说明里的 gray、slate 在 registry 里仍有文件，但文档列表里已不出现。https://github.com/shadcn-ui/ui/tree/main/apps/v4/public/r/colors
- 读 registry 的 OKLCH 值（`https://ui.shadcn.com/r/colors/<name>.json`）：各基础色的彩度都很低（背景、边框 C 在 0.003–0.02 量级），只差色相：stone 约 49–56°（暖），taupe 约 34–49°，olive 约 107°，mist 约 215–229°（冷），mauve 约 322–326°（紫）。浅色模式 `primary` 是接近黑的墨色（如 stone：L 0.216），暗色模式是近白。
- **含义**：shadcn 的「主题」本质上只是中性色温；主按钮用墨色而不是品牌色，这点和 vincent-ux 的约束一致。

**它分的是什么**：只有一个维度，中性色的色相。没有强调色，没有场景。

### 1.5 IBM Carbon

**核实到的事实**

- Carbon 提供四套主题：White、Gray 10、Gray 90、Gray 100，默认 White；文档强调「角色（role）在主题之间不可更改」，主题只换取值。https://carbondesignsystem.com/elements/themes/overview/
- 同页示例：`$background` 在 White 主题是 White，在 Gray 100 是 Gray 100；`$text-primary` 是 Gray 100 对 Gray 10。同上。
- 即**主题按明度（亮 / 暗）划分，不是按风格划分**。

**它分的是什么**：明暗。它给我们的启示是「语义角色固定、值可换」，以及明暗应当与风格主题正交。这套体系里没有「风格」维度。

### 1.6 补充：品牌个性与情绪的一手研究

这几项不是设计系统，但它们是「受众 / 场景」语义标签唯一能找到一手来源的部分。

- **Aaker (1997)** 提出品牌个性五维：Sincerity（真诚）、Excitement（激动）、Competence（能力）、Sophistication（精致）、Ruggedness（粗犷）。https://doi.org/10.2307/3151897（JSTOR DOI；SAGE 版 DOI 为 10.1177/0022243797… 因隐私检查规则略写） （经检索结果核对摘要；该量表在后续文献中有批评，且并非为中国语境建立）
- **Labrecque & Milne (2012)** 把色相映射到 Aaker 五维（蓝—competence，红—excitement），并发现饱和度和明度会放大个性特征。https://doi.org/10.1007/s11747-010-0245-y （只读到摘要转述）
- **Valdez & Mehrabian (1994)** 用 Munsell 色卡测 PAD 情绪：饱和度和明度对情绪影响强而稳定，Pleasure = .69B + .22S，Arousal = −.31B + .60S，Dominance = −.76B + .32S。https://pubmed.ncbi.nlm.nih.gov/7996122/ （只读到摘要）
- 含义：**调性主要由明度与饱和度决定，色相决定「个性」的种类**。这与 Kobayashi 三轴的对应关系一致（色相 ↔ warm/cool，明度 ↔ soft/hard，彩度 ↔ clear/grayish）。

## 2. 五套体系对比

| 体系 | 分类维度 | 一个「主题」改什么 | 对调性 | 对场景 | 对受众 | 一手来源强度 |
|---|---|---|---|---|---|---|
| Kobayashi / NCD | 暖冷 × 软硬 × 清浊（因子分析） | 整体色相、色调、彩度的取向 | 直接 | 弱 | 部分（8 Lifestyle） | 论文 + 官网；词名单只有二手 |
| Material 3 variant | 彩度 × 色相是否贴种子 | 五个调色板的色相与彩度 | 间接（只有「多鲜艳」） | 无 | 无 | 源码 |
| Radix | 灰的色倾向 × 强调色家族 | accentColor + grayColor | 间接 | 无 | 无 | 文档 + 源码 |
| shadcn | 中性色相（7 档） | 中性色板 | 间接 | 无 | 无 | 文档 + registry |
| Carbon | 明度（亮 / 暗） | 同一语义角色的取值 | 无 | 无 | 无 | 文档 |
| Aaker / Labrecque | 品牌个性五维 | 不是主题体系，是语义标签 | 部分 | 隐含 | 直接 | 论文摘要 |

读法：
- **只有 Kobayashi/NCD 是「由人对颜色的感知反推出的轴」**，其他四套是工程便利的拆法，不是调性分类。
- 四套设计系统不约而同地只让「中性色倾向」和「强调色 / 彩度」变，语义角色与明度阶梯不变。这给了我们一个稳妥的变化范围。

## 3. 推荐的分类方案

### 3.1 三层结构

| 层 | 作用 | 取自 | 在 token 里体现 |
|---|---|---|---|
| ① 定位轴（决定一套主题「是什么」） | 暖冷、软硬、清浊 | Kobayashi/NCD | 见下表 |
| ② 拆分结构（决定怎么实现） | 中性色倾向 × 强调色，语义角色固定，明度阶梯固定 | Radix / shadcn / M3 | 中性层一个文件，品牌层一个文件 |
| ③ 场景 / 受众标签（决定给谁用） | 五维个性 + 业务场景，仅作元数据 | Aaker | 主题的 `$description` 与文档，不进 token 结构 |

明暗（Carbon）是第四个、正交的轴：每个主题都要有 light 和 dark 两个取值，不当作分类维度。

### 3.2 三条轴在 vincent-ux 里的落点

| 轴 | 在本系统里控制什么 | 约束 |
|---|---|---|
| 暖—冷（色相） | 中性色相（`surface`、`text`、`line`、`fill` 的底色倾向）；强调色色相 | 中性层彩度要足够让人看出差别：Radix 自己也承认灰的差异「细微」，所以彩度 C 建议不低于约 0.006 **[推断]** |
| 软—硬（色调） | 面层之间的明度间隔、墨色深浅、边线强度 | 文字对比度底线不降：正文 ≥ 4.5:1；「软」只能在 4.5 以上收窄间隔，不能靠降低文字对比度实现 |
| 清—浊（彩度） | 强调色与图表色的彩度；中性色倾向的强弱 | 同一色相的 sRGB 可用彩度有上限（见 3.3） |

### 3.3 我自己算的两条工程约束 **[推断，OKLCH 到 sRGB 的计算]**

以现有浅色 `shell`（#F2EFE9）与暗色 `canvas`（#141210）为底，算了 12 个色相家族：

- **色相几乎是自由的，明度才是约束。** 浅色强调色文字取 OKLCH L≈0.49、暗色取 L≈0.77 时，12 个色相（红、橙、金、黄绿、绿、青绿、青、蓝、靛、紫、品红、玫红）对底的对比度都在 5.1–6.4（浅）和 8.2–9.8（暗）之间，满足 4.5:1。所以换主题时应**固定明度阶梯，只换色相与彩度**，这与 M3 固定 tone 40/80 的思路一致。
- **「清」有色相上限。** 同样在 L≈0.49 的浅色强调色，sRGB 内可达的最大彩度：青绿 0.086、青 0.086、金 0.100、黄绿 0.116，而蓝 0.160、红 0.198、靛 0.29（超出了实用范围）。所以「冷青系 + 很鲜艳」在浅色下做不到，要么降明度，要么接受偏浊。

现有主题的参照值（同样为计算）：浅色 `canvas`/`shell` 约 OKLCH 色相 84.6°、C 0.009–0.015；暗色 `canvas` 约 67.5°、C 0.005；`accent`（#80570D）约 75°、C 0.098；`critical`（#AE2F1D）约 31°。仓库里 `fill`、`scrim` 也是写死的暖色 rgba（如 `rgba(60, 44, 20, 0.05)`），出处 `tokens/src/theme.tokens.json`。**这意味着现在的「中性层」其实带着暖色倾向，要做多主题，这些 rgba 必须也变成主题变量。**

## 4. 提议的主题清单（6 核心 + 3 可选）

表中「Kobayashi 近邻词」是**本文按语义推断**的最接近的意象词，不是 NCD 的官方对应关系 **[推断]**。色相角为 OKLCH，彩度为 `C`。

| # | 主题（id） | 暖—冷 | 软—硬 | 清—浊 | 中性色倾向（≈ Radix / shadcn 近邻） | 强调色家族 | 典型场景 / 受众 | 近邻词 |
|---|---|---|---|---|---|---|---|---|
| 1 | 墨金（ink-gold，**现有**） | 暖 | 中偏硬 | 浊 | 色相约 85°，C≈0.01（sand / stone） | 金，色相 75–85°，C≈0.10 | 金额、经营看板；决策者、财务 | classic、dandy |
| 2 | 纸藏青（scholar） | 偏暖中性 + 冷强调 | 中 | 浊 | 色相约 80–90°，C≈0.008（sand / stone） | 藏青 / 墨蓝，色相 255–265°，C≈0.10–0.13 | 教育、研究报告、长文阅读；学生、教师、分析师 | formal、classic |
| 3 | 极简（mono） | 中 | 中偏硬 | 浊（近无彩） | C≤0.004，无明显色相（gray / neutral） | 低彩度单色，如石墨蓝，C≈0.05–0.08；强调靠位置不靠颜色 | 工具、文档、后台、艺术馆式的内容展示；通用 | modern、formal |
| 4 | 科技（signal） | 冷 | 硬 | 清 | 色相 215–260°，C≈0.008（slate / mist） | 电蓝 / 青，色相 215–260°，C≈0.13–0.16 | 开发者工具、数据与 AI 平台；工程师、技术决策者；暗色优先 | modern、cool-casual |
| 5 | 自然（grove） | 中偏冷 | 软 | 浊 | 色相 145–165°，C≈0.008（sage / olive） | 松青，色相 175–195°，C≈0.09–0.12 | 健康、生活方式、可持续；注重品质的大众 | natural |
| 6 | 营销（spark） | 暖 | 中 | 清 | 色相 55–75°，C≈0.010（sand / taupe，偏奶油） | 珊瑚 / 橙，色相 45–60°，C≈0.15–0.18 | 增长、活动、投放复盘；运营、市场 | dynamic、casual |
| 7 | 奢尚（aubergine，可选） | 暖冷之间（紫） | 硬 | 浊 | 色相 320–330°，C≈0.01–0.015（mauve） | 梅红 / 酒红，色相 340–355°，C≈0.10–0.12 | 高端品牌、会员、时尚；高净值受众；暗色优先 | elegant、gorgeous |
| 8 | 潮流（pop，可选） | 中 | 硬 | 清 | C≤0.004（近纯灰，让强调色说话） | 亮紫 / 酸绿，色相 295–305° 或 120–130°，C≥0.15 | 年轻人、活动、联名；Z 世代 | dynamic、wild |
| 9 | 柔雾（blush，可选，填补缺口） | 暖 | 软 | 浊偏清 | 色相 20–40°，C≈0.008（taupe） | 灰紫 / 薰衣草，色相 285–300°，C≈0.08–0.10 | 母婴、美妆、轻社交；女性消费者 | romantic、pretty |

**每套都要补的约束（本文推导，需要在落地时验证）**

- 强调色与 `critical`（约 31°）至少隔 40°，否则「强调」和「阻断」会混。营销主题的珊瑚（45–60°）离得最近，落地时要么把该主题的 `critical` 往 15–20° 偏深，要么只在选中态和链接用强调色并配形状区分。**[推断，需要色盲模拟与实屏验证]**
- 强调色与 `data positive`（绿）也要隔开：自然主题强调色选青绿 175–195° 而不是正绿，就是为了让「涨 / 正向」仍然靠得住。
- 主按钮用 ink，因此各主题**可感知的差异只来自**：中性色倾向、墨色的冷暖、强调色（链接、选中、金额重点）、图表色。主题 3 与 8 的区别全在强调色的彩度和图表，设计时要预留足够的差异，否则两套看起来一样。
- 图表色板 `viz.series-1..6`：每套主题单独定，但沿用同一明度阶梯；6 个系列的色相需要互相可分辨。色盲友好性 **[未核实]**，需要另行做仿真测试。
- 暗色：墨金、科技、奢尚、潮流适合暗色优先；自然、柔雾、纸藏青暗色要降低中性色彩度，避免脏灰。
- `accent-soft`、`critical-soft` 等「淡底」每套主题要重算，保持 `text.secondary` 在其上 ≥ 4.5:1。

## 5. 业主给的九个词怎么映射

先区分这九个词属于哪一类，再看落点。

| 词 | 实际类型 | 对应主题 | 说明 |
|---|---|---|---|
| 学院 | 场景 / 受众 | 2 纸藏青 | 色彩上落在「暖纸 + 冷深色强调、软硬居中、浊」；这是场景词，不对应独立的色彩位置 |
| 营销 | 场景 | 6 营销 | 暖、清、中偏硬。风险是强调色与 critical 靠近 |
| 媒体 | 场景 / 载体 | 3 极简 或 2 纸藏青 | 媒体是内容形态：长文、图片。色彩上要求中性、可读、不抢内容，与极简、纸藏青重叠。**没有独立的色彩位置，建议不单列** |
| 极简 | 调性 | 3 极简 | 对应 M3 的 monochrome / neutral 一侧（彩度 0–12，源码见 1.2） |
| 科技 | 调性 + 场景 | 4 科技 | 冷、硬、清。是最清晰的一个 |
| 艺术 | 载体 | 3 极简（画廊式中性）或 8 潮流 | 艺术类内容自带颜色，界面本身通常要无色倾向，避免染色。色彩上与极简几乎重合。**建议归入极简，不单列 [推断]** |
| 自然健康 | 场景 + 调性 | 5 自然 | 与 NCD「自然题材落在 GRAYISH 一侧」一致（clear-grayish 页） |
| 奢尚 | 调性 | 7 奢尚（或并入 1 墨金） | 与墨金的「深色 + 金」有重叠；差别是把中性色换成紫调，避免两套雷同 |
| 潮流 | 调性（随时间变化） | 8 潮流 | 这个词有时效性：流行色会过时，建议把它当作「高彩度、硬」的稳定定位来做，不跟具体流行色 **[推断]** |

缺口与重叠：
- **缺口一：软 + 暖 + 偏清**（柔和、可爱、轻社交）。九个词里没有对应，Kobayashi 的 romantic / pretty 在这一带，所以加了第 9 套。
- **缺口二：冷 + 软**（清新、医疗、金融信任感）。可由 5 自然的冷侧或 4 科技调软得到，若有医疗类场景再单列。
- **重叠**：媒体、艺术、极简在色彩上是同一个位置（中性、低彩度），差别在版式，而本次只改颜色。
- **词的层次不同**：学院、营销、媒体、自然健康是「用在哪里」，极简、科技、奢尚、潮流是「长什么样」，艺术是「放什么内容」。主题名建议统一用调性（长什么样），场景和受众放在描述里，这样新增场景时不用新增主题。

## 6. 落地建议

1. **先定三轴的数值区间，再取名字。** 每套主题在文档里登记它在暖冷 / 软硬 / 清浊三轴的位置，名字和场景只是标签。验收时看轴的位置是否互相拉开，而不是名字是否好听。
2. **中性层与品牌层分文件。** 现状已有 `theme.tokens.json`（中性）和 `brand.tokens.json`（品牌，注释写明「使用方项目换品牌只换这个文件」）。要补的是：把 `fill`、`scrim` 等写死的暖色 rgba 变成可替换的主题变量，让中性色倾向可以换。
3. **固定明度阶梯，只换色相和彩度。** 这样 WCAG 对比度可以用脚本一次性验证，也是 M3、Radix 能保证对比度的原因（M3 固定 tone，Radix 固定色阶用途并保证 APCA 值）。
4. **配对而不是自由组合。** 参照 Radix 的 grayColor 自动配对：每套主题的中性色倾向和强调色是绑定的，不开放任意组合，避免出现不和谐的搭配。
5. **本文未覆盖，需要后续补做：**
   - Kobayashi 15 个意象分类的权威名单 **[未核实]**。
   - 色盲友好性测试（图表 6 色、强调色与 critical 的区分）**[未核实]**。
   - 中国用户对这些主题的偏好验证：Ou 等已显示不同文化在喜好上有显著差异，轴可信，但「哪种风格更受欢迎」不能照搬日本或英国的结论。
   - m3.material.io 页面的原文描述 **[未核实]**，本文以源码为准。

## 7. 来源清单

- NCD 官网：https://ncd-ri.co.jp/service/image-scale/ 、 https://ncd-ri.co.jp/service/image-scale_select/ 、 https://ncd-ri.co.jp/service/clear-grayish/ 、 https://ncd-ri.co.jp/merchandise/new_image_scale/
- Kobayashi (1981)：https://onlinelibrary.wiley.com/doi/10.1002/col.5080060210
- Kobayashi《Color Image Scale》（Kodansha, 1990）：https://archive.org/details/colorimagescale00koba （仅可借阅，未读全文）
- 二手转述：https://www.diva-portal.org/smash/get/diva2:325913/FULLTEXT01.pdf 、 http://p-www.iwate-pu.ac.jp/~dai/kansei/chapter2.pdf
- Ou et al. (2004)：https://onlinelibrary.wiley.com/doi/abs/10.1002/col.20010
- Material Color Utilities 源码：https://github.com/material-foundation/material-color-utilities/tree/main/typescript/dynamiccolor
- Flutter DynamicSchemeVariant：https://api.flutter.dev/flutter/material/DynamicSchemeVariant.html
- Radix Colors：https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette 、 https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
- Radix Themes：https://www.radix-ui.com/themes/docs/theme/color 、 https://github.com/radix-ui/themes/tree/main/packages/radix-ui-themes/src
- shadcn/ui：https://ui.shadcn.com/docs/theming 、 https://ui.shadcn.com/r/colors/stone.json （及 mist、taupe、mauve、olive）
- IBM Carbon：https://carbondesignsystem.com/elements/themes/overview/
- Aaker (1997)：https://doi.org/10.2307/3151897（JSTOR DOI；SAGE 版 DOI 为 10.1177/0022243797… 因隐私检查规则略写）
- Labrecque & Milne (2012)：https://doi.org/10.1007/s11747-010-0245-y
- Valdez & Mehrabian (1994)：https://pubmed.ncbi.nlm.nih.gov/7996122/
