// 发布前检查源码、暂存区与提交身份；仅报告位置，不输出匹配值。
import { readFileSync, lstatSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rules = [
  ['private-key', /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/g],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g],
  ['service-key', /\b(?:AKIA[0-9A-Z]{16}|sk-(?:proj-)?[A-Za-z0-9_-]{32,}|AIza[A-Za-z0-9_-]{35})\b/g],
  ['credential-value', /\b(?:api[_-]?key|client[_-]?secret|access[_-]?token|password|authorization)\s*[:=]\s*["'](?:Bearer\s+)?[A-Za-z0-9_+/.=-]{16,}["']/gi],
  ['credential-url', /https?:\/\/[^\s/<>"']+:[^\s/<>"']+@/g],
  ['home-path', /(?:\/Users\/|\/home\/)[^\s/<>"'`]+|[A-Za-z]:\\Users\\[^\s\\<>"'`]+|~\/(?:Design|Product|Creation)(?:\/|\b)/g],
  ['private-network', /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b|https?:\/\/[^\s/<>"']+\.(?:internal|local|corp)(?=[:/\s]|$)/gi],
  ['phone-or-id', /\b(?:1[3-9]\d{9}|\d{17}[0-9Xx])\b/g],
]
const publicEmail = /@(?:users\.noreply\.github\.com|(?:[\w-]+\.)?example\.(?:com|net|org)|localhost)$/i

export function scanText(source) {
  const findings = []
  for (const [rule, pattern] of rules) {
    for (const match of source.matchAll(pattern)) findings.push({ rule, line: source.slice(0, match.index).split('\n').length })
  }
  for (const match of source.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) {
    if (!publicEmail.test(match[0])) findings.push({ rule: 'personal-email', line: source.slice(0, match.index).split('\n').length })
  }
  return findings
}

function main() {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] })
  const files = [...new Set(git('ls-files', '--cached', '--others', '--exclude-standard', '-z').split('\0').filter(Boolean))]
  const findings = []
  const inspect = (path, source) => {
    for (const item of scanText(source)) findings.push(`${path}:${item.line} ${item.rule}`)
  }
  for (const path of files) {
    if (/(?:^|\/)(?:\.env(?:\..*)?|\.npmrc|\.netrc|credentials(?:\..*)?|id_(?:rsa|ed25519)|[^/]+\.(?:pem|key|p12|pfx))$/i.test(path) && !path.endsWith('.env.example')) findings.push(`${path} sensitive-filename`)
    const absolute = resolve(root, path)
    if (lstatSync(absolute).isSymbolicLink()) { findings.push(`${path} symlink-requires-review`); continue }
    const bytes = readFileSync(absolute)
    if (bytes.includes(0)) { findings.push(`${path} binary-requires-review`); continue }
    inspect(path, bytes.toString('utf8'))
  }
  // 暂存内容可能与工作区不同，两者都检查。
  for (const path of git('diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z').split('\0').filter(Boolean)) inspect(`index/${path}`, git('show', `:${path}`))
  if (Number(git('rev-list', '--all', '--count')) > 0) inspect('git-identities', git('log', '--all', '--format=%an <%ae>%n%cn <%ce>'))
  for (const finding of [...new Set(findings)]) console.error(finding)
  console.log(findings.length ? `隐私检查失败：${findings.length} 个发现` : `✓ 隐私规则检查通过（${files.length} 个文件）`)
  process.exitCode = findings.length ? 1 : 0
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main() } catch { console.error('隐私检查未完成：请确认 Git 仓库、文件和提交均可读取。'); process.exitCode = 2 }
}
