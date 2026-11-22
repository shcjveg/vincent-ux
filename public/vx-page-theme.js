// 全页示例入口。路由传递配色，明暗沿用同源页面的用户偏好。
(() => {
  const root = document.documentElement
  const palette = new URLSearchParams(location.search).get('palette')
  if (palette) root.dataset.palette = palette
  try {
    const mode = localStorage.getItem('vx-theme')
    if (mode === 'light' || mode === 'dark') root.dataset.theme = mode
  } catch { /* 无存储权限时，沿用页面或系统明暗。 */ }
})()
