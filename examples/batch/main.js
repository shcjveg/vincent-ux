// The product owns record identity, write permissions and per-record receipts.
const form = document.querySelector('form')
const date = form.elements.delivery
const submit = form.querySelector('[type=submit]')
const restart = document.querySelector('#restart')
const status = form.querySelector('[role=status]')
const rows = [...form.querySelectorAll('[data-order]')].map(el => ({
  id: el.dataset.order, check: el.querySelector('input'), date: el.querySelector('time'), result: el.querySelector('[data-result]'),
}))
let batch = null
let saving = false

// Local demonstration service. One unavailable supplier responds on the next attempt.
const unavailable = new Set(['PO-102'])
async function saveDelivery(ids, delivery) {
  await new Promise(resolve => setTimeout(resolve, 150))
  return ids.map(id => ({ id, delivery, ok: !unavailable.delete(id) }))
}

function preview() {
  const selected = rows.filter(row => row.check.checked)
  for (const row of rows) row.result.textContent = row.check.checked ? '待提交' : '待选择'
  status.textContent = selected.length && date.value
    ? `将把 ${selected.map(row => row.id).join('、')} 的交期改为 ${date.value}。` : '请选择订单并填写新交期。'
  submit.textContent = `确认修改 ${selected.length} 笔订单`
  submit.disabled = !selected.length || !date.value
}
form.addEventListener('input', preview)
form.addEventListener('submit', async event => {
  event.preventDefault()
  if (saving || batch?.failed.length === 0) return
  const ids = batch?.failed ?? rows.filter(row => row.check.checked).map(row => row.id)
  if (!ids.length || !date.value) return
  batch ??= { delivery: date.value, total: ids.length, failed: ids }
  saving = true
  submit.disabled = date.disabled = true
  restart.hidden = true
  for (const row of rows) row.check.disabled = true
  status.textContent = `正在修改 ${ids.length} 笔订单。`
  const receipts = await saveDelivery(ids, batch.delivery)
  batch.failed = receipts.filter(item => !item.ok).map(item => item.id)
  for (const item of receipts) {
    const row = rows.find(row => row.id === item.id)
    if (item.ok) row.date.textContent = item.delivery
    row.result.textContent = item.ok ? '已更新' : '供应商暂时无响应'
  }
  saving = false
  const count = batch.failed.length
  status.textContent = count
    ? `已更新 ${batch.total - count} 笔。${batch.failed.join('、')} 更新失败，重试仍使用 ${batch.delivery}。`
    : `全部 ${batch.total} 笔已更新至 ${batch.delivery}。`
  submit.hidden = !count
  submit.disabled = !count
  submit.textContent = `重试 ${count} 笔失败订单`
  restart.hidden = false
  status.focus()
})
restart.addEventListener('click', () => {
  batch = null
  date.disabled = false
  for (const row of rows) { row.check.disabled = false; row.check.checked = false }
  restart.hidden = true
  submit.hidden = false
  preview()
  rows[0].check.focus()
})
preview()
