import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button, Icon, PortalFeed } from '../components/react'

const accounts = [
  { id: 'brand-a', name: '品牌 A · 系列一' },
  { id: 'brand-b', name: '品牌 B · 系列二' },
]

export function PortalExample() {
  const [signed, setSigned] = useState('')
  const [error, setError] = useState<{ field: 'account' | 'passcode'; message: string } | null>(null)
  const account = useRef<HTMLInputElement>(null)
  const passcode = useRef<HTMLInputElement>(null)
  const result = useRef<HTMLHeadingElement>(null)
  const returning = useRef(false)
  useEffect(() => {
    if (signed) result.current?.focus({ preventScroll: true })
    else if (returning.current) account.current?.focus({ preventScroll: true })
  }, [signed])

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = account.current?.value.trim()
    const found = accounts.find(item => item.id === value)
    if (!found) {
      setError({ field: 'account', message: value ? '请选择下方列出的演示账号。' : '请输入演示账号。' })
      account.current?.focus()
    } else if (passcode.current?.value !== 'demo') {
      setError({ field: 'passcode', message: '请输入示例密码 demo。' })
      passcode.current?.focus()
    } else {
      setError(null)
      setSigned(found.name)
    }
  }

  return <main className="vx-portal" data-testid="portal-demo">
    <PortalFeed />
    <section className="vx-portal-panel">
      {signed ? <>
        <h1 className="vx-portal-title" ref={result} tabIndex={-1}>内容看板</h1>
        <p className="vx-portal-lead">已登录 {signed}</p>
        <Button onClick={() => { returning.current = true; setSigned(''); setError(null) }}>切换账号</Button>
      </> : <>
        <div className="vx-rise" style={{ '--i': 0 } as React.CSSProperties}><h1 className="vx-portal-title">内容看板</h1><p className="vx-portal-lead">使用下方演示账号登录，示例密码为 demo。</p></div>
        <form className="vx-portal-form vx-rise" style={{ '--i': 1 } as React.CSSProperties} onSubmit={submit} noValidate>
          <div className="vx-portal-fields">
            <label className="vx-portal-field"><span>账号</span><input ref={account} className="vx-portal-input" autoComplete="off" required
              aria-invalid={error?.field === 'account' || undefined} aria-describedby={error?.field === 'account' ? 'portal-error' : undefined} /></label>
            <label className="vx-portal-field"><span>密码</span><input ref={passcode} className="vx-portal-input" type="password" autoComplete="off" required
              aria-invalid={error?.field === 'passcode' || undefined} aria-describedby={error?.field === 'passcode' ? 'portal-error' : undefined} /></label>
          </div>
          {error && <p role="alert" className="vx-field-error" id="portal-error">{error.message}</p>}
          <Button type="submit" variant="primary">登录</Button>
        </form>
        <div className="vx-portal-quick vx-rise" style={{ '--i': 2 } as React.CSSProperties}><span className="vx-portal-quick-caption">演示账号</span>
          {accounts.map(item => <button key={item.id} type="button" className="vx-portal-account" onClick={() => setSigned(item.name)}>
            <span><span className="vx-portal-account-name">{item.name}</span><span className="vx-portal-account-meta">{item.id}</span></span><Icon name="next" />
          </button>)}
        </div>
      </>}
    </section>
  </main>
}
