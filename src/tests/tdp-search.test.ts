import { describe, it, expect } from 'vitest'
import { createTdpFuseInstance } from '../utils/search'
import type { TdpProduct } from '../types/performance'

const products: TdpProduct[] = [
  {
    product_name: 'Employee Section',
    investment_menu_name: 'ANZ Staff Super Investment Menu',
    investment_option_name: 'Aggressive Growth',
    product_type: 'Platform TDP',
    current_metrics_available: true,
    pass_fail_current: 'Pass',
    nir_10yr: 0.085,
    nir_rag: 'Green',
    fees_50k: 0.005,
    fees_50k_rag: 'Green',
    fees_100k: 0.004,
    fees_100k_rag: 'Green',
    history: { '2025': 'Pass', '2024': 'Pass' },
  },
  {
    product_name: 'Personal Section',
    investment_menu_name: 'BT Super Investment Options',
    investment_option_name: 'Balanced',
    product_type: 'Platform TDP',
    current_metrics_available: false,
    pass_fail_current: null,
    nir_10yr: null,
    nir_rag: null,
    fees_50k: null,
    fees_50k_rag: null,
    fees_100k: null,
    fees_100k_rag: null,
    history: {},
  },
  {
    product_name: 'Partner Section',
    investment_menu_name: 'ANZ Staff Super Investment Menu',
    investment_option_name: 'Balanced',
    product_type: 'Platform TDP',
    current_metrics_available: true,
    pass_fail_current: 'Pass',
    nir_10yr: 0.065,
    nir_rag: 'Amber',
    fees_50k: 0.006,
    fees_50k_rag: 'Amber',
    fees_100k: 0.005,
    fees_100k_rag: 'Amber',
    history: { '2025': 'Pass' },
  },
]

describe('createTdpFuseInstance', () => {
  it('finds by investment_option_name', () => {
    const fuse = createTdpFuseInstance(products)
    const results = fuse.search('Aggressive')
    expect(results).toHaveLength(1)
    expect(results[0].item.investment_option_name).toBe('Aggressive Growth')
  })

  it('finds by investment_menu_name', () => {
    const fuse = createTdpFuseInstance(products)
    const results = fuse.search('BT Super')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].item.investment_menu_name).toBe('BT Super Investment Options')
  })

  it('finds by product_name (section)', () => {
    const fuse = createTdpFuseInstance(products)
    const results = fuse.search('Employee')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.item.product_name === 'Employee Section')).toBe(true)
  })

  it('returns per-field match indices when includeMatches is true', () => {
    const fuse = createTdpFuseInstance(products)
    const results = fuse.search('Aggressive')
    expect(results[0].matches).toBeDefined()
    const optionMatch = results[0].matches?.find(m => m.key === 'investment_option_name')
    expect(optionMatch).toBeDefined()
    expect(optionMatch?.indices).toBeDefined()
  })

  it('ranks investment_option_name match higher than menu-name-only match', () => {
    const fuse = createTdpFuseInstance(products)
    const results = fuse.search('Aggressive Growth')
    expect(results[0].item.investment_option_name).toBe('Aggressive Growth')
  })

  it('returns multiple results when option name is common', () => {
    const fuse = createTdpFuseInstance(products)
    const results = fuse.search('Balanced')
    expect(results.length).toBe(2)
  })

  it('returns an empty array when nothing matches', () => {
    const fuse = createTdpFuseInstance(products)
    const results = fuse.search('zzzzzzz')
    expect(results).toHaveLength(0)
  })
})
