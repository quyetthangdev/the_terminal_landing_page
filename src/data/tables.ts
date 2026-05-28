export interface Table {
  id: string
  label: string
  seats: number
  gridCol: number  // 1–4
  gridRow: number  // 1–3
}

export const tables: Table[] = [
  { id: '01', label: 'Bàn 01', seats: 4, gridCol: 1, gridRow: 1 },
  { id: '02', label: 'Bàn 02', seats: 2, gridCol: 2, gridRow: 1 },
  { id: '03', label: 'Bàn 03', seats: 4, gridCol: 3, gridRow: 1 },
  { id: '04', label: 'Bàn 04', seats: 6, gridCol: 4, gridRow: 1 },
  { id: '05', label: 'Bàn 05', seats: 4, gridCol: 1, gridRow: 2 },
  { id: '06', label: 'Bàn 06', seats: 2, gridCol: 2, gridRow: 2 },
  { id: '07', label: 'Bàn 07', seats: 4, gridCol: 3, gridRow: 2 },
  { id: '08', label: 'Bàn 08', seats: 4, gridCol: 4, gridRow: 2 },
  { id: '09', label: 'Bàn 09', seats: 6, gridCol: 1, gridRow: 3 },
  { id: '10', label: 'Bàn 10', seats: 4, gridCol: 2, gridRow: 3 },
  { id: '11', label: 'Bàn 11', seats: 2, gridCol: 3, gridRow: 3 },
  { id: '12', label: 'Bàn 12', seats: 8, gridCol: 4, gridRow: 3 },
]

/** Sinh 4 mệnh giá preset cho tiền mặt dựa trên tổng bill */
export function generatePresets(total: number): number[] {
  const step = 50_000
  const first = Math.ceil(total / step) * step
  const second = first + step
  const third = Math.ceil((second + 1) / 100_000) * 100_000
  const fourth = total <= 250_000 ? 500_000 : 1_000_000
  return [first, second, third, fourth]
}
