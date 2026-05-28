/** 300000 → "300.000" */
export function formatAmount(n: number): string {
  return n.toLocaleString('vi-VN')
}

/** 300000 → "300.000đ" */
export function formatVnd(n: number): string {
  return formatAmount(n) + 'đ'
}

/** "400.000" or "400000" → 400000; returns NaN if unparseable */
export function parseAmount(s: string): number {
  return parseInt(s.replace(/\./g, '').replace(/,/g, ''), 10)
}
