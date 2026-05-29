/** 300000 → "300.000" */
export function formatAmount(n: number): string {
  return n.toLocaleString('vi-VN')
}

/** 300000 → "300.000đ" */
export function formatVnd(n: number): string {
  return formatAmount(n) + 'đ'
}
