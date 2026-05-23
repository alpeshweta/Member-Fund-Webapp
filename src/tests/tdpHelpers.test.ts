import { describe, it, expect } from 'vitest'
import { getUniqueProductNames, getOptionsForProduct } from '../utils/tdpHelpers'
import type { TdpProduct } from '../types/performance'

const makeOption = (
  product_name: string,
  investment_option_name: string,
  investment_menu_name = '',
): TdpProduct => ({
  product_name,
  investment_menu_name,
  investment_option_name,
  product_type: 'Platform TDP',
  current_metrics_available: true,
  pass_fail_current: 'Pass',
  nir_10yr: null,
  nir_rag: null,
  fees_50k: null,
  fees_50k_rag: null,
  fees_100k: null,
  fees_100k_rag: null,
  history: {},
})

const fixtures: TdpProduct[] = [
  makeOption('Zenith Super', 'Growth Option'),
  makeOption('Zenith Super', 'Balanced Option'),
  makeOption('Apex Fund', 'Conservative'),
  makeOption('Apex Fund', 'Aggressive'),
  makeOption('Apex Fund', 'Moderate'),
  makeOption('Beta Retirement', 'Default MySuper'),
]

describe('getUniqueProductNames', () => {
  it('returns each product name exactly once', () => {
    const names = getUniqueProductNames(fixtures)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
    expect(names).toContain('Zenith Super')
    expect(names).toContain('Apex Fund')
    expect(names).toContain('Beta Retirement')
  })

  it('returns names in alphabetical order', () => {
    const names = getUniqueProductNames(fixtures)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })

  it('returns an empty array for empty input', () => {
    expect(getUniqueProductNames([])).toEqual([])
  })

  it('handles a single product appearing multiple times', () => {
    const tdp = [
      makeOption('Solo Fund', 'Option A'),
      makeOption('Solo Fund', 'Option B'),
      makeOption('Solo Fund', 'Option C'),
    ]
    expect(getUniqueProductNames(tdp)).toEqual(['Solo Fund'])
  })

  it('handles a single record', () => {
    expect(getUniqueProductNames([makeOption('Only Fund', 'Default')])).toEqual(['Only Fund'])
  })
})

describe('getOptionsForProduct', () => {
  it('returns only the options belonging to the requested product', () => {
    const options = getOptionsForProduct(fixtures, 'Apex Fund')
    expect(options).toHaveLength(3)
    options.forEach((o) => expect(o.product_name).toBe('Apex Fund'))
  })

  it('returns options sorted alphabetically by investment_option_name', () => {
    const options = getOptionsForProduct(fixtures, 'Apex Fund')
    const names = options.map((o) => o.investment_option_name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })

  it('returns an empty array when no options match the product name', () => {
    expect(getOptionsForProduct(fixtures, 'Nonexistent Fund')).toEqual([])
  })

  it('returns a single option when the product has exactly one', () => {
    const options = getOptionsForProduct(fixtures, 'Beta Retirement')
    expect(options).toHaveLength(1)
    expect(options[0].investment_option_name).toBe('Default MySuper')
  })

  it('is case-sensitive on product name', () => {
    expect(getOptionsForProduct(fixtures, 'apex fund')).toEqual([])
    expect(getOptionsForProduct(fixtures, 'APEX FUND')).toEqual([])
  })
})
