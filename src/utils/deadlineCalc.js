export function calcDeadlineDate(dateStr, days) {
  if (!dateStr || !days) return ''
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((new Date(dateStr) - today) / 86400000)
}

// Verification:
// console.log(calcDeadlineDate('2026-06-08', 20)) // => '2026-06-28'
// console.log(calcDeadlineDate('2026-06-08', 10)) // => '2026-06-18'
// console.log(daysUntil('2026-06-15')) // => 7 (if today is 2026-06-08)
