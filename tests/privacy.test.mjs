import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scanText } from '../scripts/check-privacy.mjs'

test('隐私检查识别凭据、身份和本机路径，报告不包含原值', () => {
  const cases = [
    ['github-token', 'gh' + 'p_' + 'a'.repeat(40)],
    ['private-key', '-----BEGIN ' + 'OPENSSH PRIVATE KEY-----'],
    ['service-key', 'AK' + 'IA' + 'A'.repeat(16)],
    ['credential-value', 'password: "' + 'a'.repeat(24) + '"'],
    ['credential-url', 'https://' + 'person:secret@' + 'example.com'],
    ['personal-email', 'person' + '@' + 'mail.test'],
    ['home-path', '/Users/' + 'someone/private'],
    ['private-network', ['192', '168', '1', '2'].join('.')],
    ['phone-or-id', '138' + '0'.repeat(8)],
  ]
  for (const [rule, value] of cases) {
    const findings = scanText('\n' + value)
    assert.ok(findings.some(item => item.rule === rule && item.line === 2), rule)
    assert.ok(!JSON.stringify(findings).includes(value), rule)
  }
})

test('隐私检查允许公共依赖、示例身份、GitHub 隐私邮箱和回环地址', () => {
  for (const value of ['https://registry.npmjs.org/react', 'https://github.com/shcjveg/vincent-ux', 'person@example.com', '123+person@users.noreply.github.com', 'http://127.0.0.1:5190']) assert.deepEqual(scanText(value), [])
})
