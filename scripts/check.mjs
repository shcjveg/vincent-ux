// 质量检查：设计系统自己用，也可以在使用方项目里跑
// 用法：node scripts/check.mjs [目录...]      默认检查本仓库的 components/ 与 templates/
// 检查项
//   1. 裸色值：CSS 里出现 #hex / rgb() / hsl()（设计变量文件与注释除外）
//   2. 间距刻度：padding / margin / gap 用了不在刻度里的 px 值（不在刻度时失败）
//   3. 禁用图标：引用了 icons.json forbidden 里的图标
//   4. 对比度：主题文字色在各级面上的对比度（只对本仓库）
//   5. 使用方页面 CSS 直接用品牌色（只提示）：颜色语义应由设计系统的语义类承担
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { checkProject, report } from './check-project.mjs'
import { projectRules } from './project-rules.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const targets = process.argv.slice(2).length ? process.argv.slice(2) : [join(ROOT, 'components'), join(ROOT, 'templates')]
const icons = JSON.parse(readFileSync(join(ROOT, 'icons/icons.json'), 'utf8'))
for (const target of targets) if (!existsSync(target)) { console.error(`检查目录不存在：${target}`); process.exit(2) }
const result = checkProject(targets, projectRules(ROOT), process.argv.length > 2)
const { errors } = result
const iconSrc = readFileSync(join(ROOT, 'components/react/Icon.tsx'), 'utf8')

// 图标：React 组件里的含义必须和 icons.json 一一对应；使用方直接 import lucide-react 的地方提示改用 <Icon>
const meanings = Object.values(icons.meanings).flatMap((g) => Object.keys(g).filter((k) => !k.startsWith('$')))
const iconKeys = [...iconSrc.slice(iconSrc.indexOf('const ICONS'), iconSrc.indexOf('satisfies')).matchAll(/'?([a-z][a-z-]*)'?:\s*[A-Z]/g)].map((m) => m[1])
for (const k of meanings) if (!iconKeys.includes(k)) errors.push(`Icon.tsx 缺少含义 ${k}（icons.json 里有）`)
for (const k of iconKeys) if (!meanings.includes(k)) errors.push(`Icon.tsx 的含义 ${k} 没有在 icons.json 登记`)

// 按实际用途检查；透明面先与底层合成，普通小字一律 4.5:1。默认配色与每套配色主题（tokens/dist/tokens.json 的 palettes）逐套核对。
if (!process.argv.slice(2).length) {
  const { blend, contrast, parse: rgb, toOklch } = await import('./color.mjs')
  const source = { theme: JSON.parse(readFileSync(join(ROOT, 'tokens/src/theme.tokens.json'), 'utf8')), brand: JSON.parse(readFileSync(join(ROOT, 'tokens/src/brand.tokens.json'), 'utf8')) }
  const { palettes = {} } = JSON.parse(readFileSync(join(ROOT, 'tokens/dist/tokens.json'), 'utf8'))
  for (const [id, palette] of Object.entries(palettes)) {
    const t = structuredClone(source.theme), b = structuredClone(source.brand)
    for (const { path, light, dark } of palette.tokens) {
      const [group, key] = path, target = group === 'brand' || group === 'viz' ? b : t
      Object.assign(target[group][key], { light, dark })
    }
    // 与 CSS 一样，从当前主题解析单色别名；只为渐变的两个色标单独核对。
    function color(group, key, mode) {
      const token = (b[group] ?? t[group])[key]
      const value = token[mode] ?? token.$value
      const alias = /^var\(--vx-([a-z]+)-([a-z-]+)\)$/.exec(value)
      return alias ? color(alias[1], alias[2], mode) : value
    }
    const verify = (label, fg, bg, min) => { const r = contrast(rgb(fg), bg); if (r < min) errors.push(`对比度 [${id}] ${label} = ${r.toFixed(2)}，需 ≥ ${min}`) }
    // 强调色（选中、等你动手）与危急色（阻断、超时）色相至少隔 40°，免得两种语气看成一种。
    const hue = (c) => toOklch(rgb(c))[2], gap = (x, y) => { const d = Math.abs(x - y) % 360; return Math.min(d, 360 - d) }
    for (const mode of ['light', 'dark']) {
      const d = gap(hue(b.brand.accent[mode]), hue(b.brand.critical[mode]))
      if (d < 40) errors.push(`色相 [${id}] ${mode} brand-accent 与 brand-critical 只隔 ${d.toFixed(0)}°，需 ≥ 40°`)
    }
    for (const mode of ['light', 'dark']) {
      const readingInk = {
        primary: t.text.primary[mode], secondary: t.text.secondary[mode], tertiary: t.text.tertiary[mode],
        link: t.text.link[mode] ?? b.brand.accent[mode],
      }
      const verifyReading = (bg, label) => {
        for (const [role, value] of Object.entries(readingInk)) verify(`${mode} text-${role} / ${label}`, value, bg, 4.5)
      }
      const surfaces = Object.entries(t.surface).filter(([key]) => !key.startsWith('$') && key !== 'scrim')
      const layers = ['canvas', 'shell', 'card'].map(key => toOklch(rgb(t.surface[key][mode]))[0])
      if (layers.some((l, i) => i > 0 && l <= layers[i - 1])) errors.push(`[${id}] ${mode} 画布、承载区与内容卡的明度次序有误`)
      for (const [surface, value] of surfaces) {
        for (const under of ['canvas', 'card']) {
          const bg = blend(rgb(value[mode]), rgb(t.surface[under][mode]))
          for (const k of ['positive', 'negative']) if (t.data?.[k]) verify(`${mode} data-${k} / ${surface}`, t.data[k][mode], bg, 4.5)
          verifyReading(bg, surface)
          for (const k of ['accent', 'critical', 'warning']) verify(`${mode} brand-${k} / ${surface}`, b.brand[k][mode], bg, 4.5)
          verify(`${mode} focus / ${surface}`, t.focus.ring[mode], bg, 3)
          verify(`${mode} control / ${surface}`, t.line.control[mode], bg, 3)
        }
      }
      for (const surface of ['shell', 'card']) {
        const bg = rgb(t.surface[surface][mode])
        const hierarchy = ['primary', 'secondary', 'tertiary', 'muted'].map(k => contrast(rgb(t.text[k][mode]), bg))
        if (hierarchy.some((ratio, i) => i > 0 && ratio >= hierarchy[i - 1])) errors.push(`[${id}] ${mode} 在 ${surface} 上的文字层级次序有误`)
        verify(`${mode} text-muted / ${surface}`, t.text.muted[mode], bg, 4.5)
        for (const state of ['hover', 'selected']) verifyReading(blend(rgb(t.fill[state][mode]), bg), `${surface} + ${state}`)
      }
      for (const tone of ['accent', 'critical', 'warning']) {
        const bg = blend(rgb(b.brand[`${tone}-soft`][mode]), rgb(t.surface.card[mode]))
        verifyReading(bg, `${tone}-soft`)
        verify(`${mode} ${tone} / soft`, b.brand[tone][mode], bg, 4.5)
      }
      const field = color('brand', 'field', mode)
      verify(mode + ' 品牌区文字', color('brand', 'on-field', mode), rgb(field), 4.5)
      const selected = color('selection', 'fill', mode)
      verify(mode + ' 选中标记', color('selection', 'on-fill', mode), rgb(selected), 4.5)
      if (palette.swatches && (field !== palette.swatches[0] || t.action.fill[mode] !== palette.swatches[2])) {
        errors.push(`品牌原色 [${id}] ${mode} 识别区或主按钮偏离色卡`)
      }
      const label = color('action', 'text', mode)
      const edge = color('action', 'edge', mode)
      const inverseEdge = color('action', 'edge-on-strong', mode)
      const inverse = rgb(t.ink.base[mode])
      if (palette.swatches && toOklch(rgb(label))[1] > 0.025) errors.push(`主动作 [${id}] ${mode} 字色过艳`)
      const paints = [t.action.fill[mode] ?? t.ink.base[mode], t.action['fill-hover'][mode] ?? t.ink.top[mode]]
      if (!t.action.fill[mode]) paints.push(t.ink.top[mode])
      for (const fill of new Set(paints)) {
        const paint = rgb(fill)
        verify(`${mode} 主动作文字 / ${fill}`, label, paint, 4.5)
        if (Math.max(contrast(paint, inverse), inverseEdge === 'transparent' ? 0 : contrast(rgb(inverseEdge), inverse)) < 3) {
          errors.push(`主动作 [${id}] ${mode} 在反色说明面上的边界未达 3:1`)
        }
        for (const [key, surface] of surfaces) {
          const bg = blend(rgb(surface[mode]), rgb(t.surface.canvas[mode]))
          if (Math.max(contrast(paint, bg), edge === 'transparent' ? 0 : contrast(rgb(edge), bg)) < 3) {
            errors.push(`主动作 [${id}] ${mode} 边界 / ${key} 未达 3:1`)
          }
        }
      }
      for (const stop of ['base', 'top']) verify(`${mode} 主按钮 ${stop}`, t.text['on-strong'][mode], rgb(t.ink[stop][mode]), 4.5)
      verify(`${mode} 红色计数`, t.text['on-critical'][mode], rgb(b.brand.critical[mode]), 4.5)
    }
  }
}

process.exitCode = report(result)
