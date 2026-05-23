import { describe, it, expect } from 'vitest'
import { computeRiskSignal } from '../utils/riskSignal'

describe('computeRiskSignal', () => {
  it('returns no-data for empty history', () => {
    expect(computeRiskSignal({})).toBe('no-data')
  })

  it('returns insufficient for exactly one year of history', () => {
    expect(computeRiskSignal({ '2025': 'Pass' })).toBe('insufficient')
    expect(computeRiskSignal({ '2025': 'Fail' })).toBe('insufficient')
    expect(computeRiskSignal({ '2025': 'Unknown' })).toBe('insufficient')
    expect(computeRiskSignal({ '2025': null })).toBe('insufficient')
  })

  it('returns critical when the two most recent years are both Fail', () => {
    expect(computeRiskSignal({ '2025': 'Fail', '2024': 'Fail' })).toBe('critical')
  })

  it('returns critical regardless of older passing years', () => {
    expect(
      computeRiskSignal({ '2025': 'Fail', '2024': 'Fail', '2023': 'Pass', '2022': 'Pass' }),
    ).toBe('critical')
  })

  it('returns warning when latest year is Fail but previous is not Fail', () => {
    expect(computeRiskSignal({ '2025': 'Fail', '2024': 'Pass' })).toBe('warning')
    expect(computeRiskSignal({ '2025': 'Fail', '2024': 'Unknown' })).toBe('warning')
    expect(computeRiskSignal({ '2025': 'Fail', '2024': null })).toBe('warning')
  })

  it('returns clear when latest year is Pass', () => {
    expect(computeRiskSignal({ '2025': 'Pass', '2024': 'Fail' })).toBe('clear')
    expect(computeRiskSignal({ '2025': 'Pass', '2024': 'Pass' })).toBe('clear')
    expect(computeRiskSignal({ '2025': 'Pass', '2024': 'Unknown' })).toBe('clear')
  })

  it('returns unknown when latest year is Unknown', () => {
    expect(computeRiskSignal({ '2025': 'Unknown', '2024': 'Pass' })).toBe('unknown')
    expect(computeRiskSignal({ '2025': 'Unknown', '2024': 'Fail' })).toBe('unknown')
  })

  it('returns unknown when latest year is null', () => {
    expect(computeRiskSignal({ '2025': null, '2024': 'Pass' })).toBe('unknown')
  })

  it('Unknown in the previous year does not trigger critical', () => {
    // latest=Fail, previous=Unknown → warning, not critical
    expect(computeRiskSignal({ '2025': 'Fail', '2024': 'Unknown' })).toBe('warning')
  })

  it('uses year sort order not insertion order to find latest year', () => {
    // Keys inserted oldest-first; computation must sort descending
    expect(computeRiskSignal({ '2023': 'Fail', '2024': 'Fail', '2025': 'Pass' })).toBe('clear')
    expect(computeRiskSignal({ '2023': 'Pass', '2024': 'Pass', '2025': 'Fail' })).toBe('warning')
  })

  it('handles a three-year history where only the last two matter', () => {
    expect(
      computeRiskSignal({ '2025': 'Fail', '2024': 'Fail', '2023': 'Pass' }),
    ).toBe('critical')
    expect(
      computeRiskSignal({ '2025': 'Pass', '2024': 'Fail', '2023': 'Fail' }),
    ).toBe('clear')
  })
})
