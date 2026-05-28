import { describe, it, expect } from 'vitest'
import { generatePresets } from '@/data/tables'

describe('generatePresets', () => {
  it('rounds up to nearest 50k and generates 4 options (small bill)', () => {
    expect(generatePresets(180_000)).toEqual([200_000, 250_000, 300_000, 500_000])
  })

  it('rounds up to nearest 50k and generates 4 options (mid bill)', () => {
    expect(generatePresets(345_000)).toEqual([350_000, 400_000, 500_000, 1_000_000])
  })

  it('handles exact multiple of 50k', () => {
    const [first] = generatePresets(200_000)
    expect(first).toBe(200_000)
  })

  it('always returns exactly 4 values', () => {
    expect(generatePresets(99_000)).toHaveLength(4)
    expect(generatePresets(1_200_000)).toHaveLength(4)
  })
})
