import { describe, it, expect } from 'vitest'
import { formatPercent } from '../utils/formatters'

describe('formatPercent', () => {
  it('returns Not available for null', () => {
    expect(formatPercent(null)).toBe('Not available')
  })

  it('formats a typical NIR value correctly', () => {
    expect(formatPercent(0.0675)).toBe('6.75% p.a.')
  })

  it('formats a typical fee value correctly', () => {
    expect(formatPercent(0.0016)).toBe('0.16% p.a.')
  })

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.00% p.a.')
  })

  it('formats exactly 100%', () => {
    expect(formatPercent(1)).toBe('100.00% p.a.')
  })

  it('rounds to 2 decimal places', () => {
    expect(formatPercent(0.06789)).toBe('6.79% p.a.')
  })

  it('formats a negative value', () => {
    expect(formatPercent(-0.015)).toBe('-1.50% p.a.')
  })
})
