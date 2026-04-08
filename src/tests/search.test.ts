import { describe, it, expect } from 'vitest'
import { highlightMatches, createFuseInstance } from '../utils/search'
import type { MySuperProduct } from '../types/performance'

describe('highlightMatches', () => {
  it('returns whole string as non-highlighted when no indices', () => {
    expect(highlightMatches('AustralianSuper', [])).toEqual([
      { text: 'AustralianSuper', highlight: false },
    ])
  })

  it('highlights a single range at the start', () => {
    expect(highlightMatches('AustralianSuper', [[0, 2]])).toEqual([
      { text: 'Aus', highlight: true },
      { text: 'tralianSuper', highlight: false },
    ])
  })

  it('highlights a range in the middle', () => {
    expect(highlightMatches('AustralianSuper', [[10, 13]])).toEqual([
      { text: 'Australian', highlight: false },
      { text: 'Supe', highlight: true },
      { text: 'r', highlight: false },
    ])
  })

  it('highlights a range at the end', () => {
    expect(highlightMatches('MySuper', [[2, 6]])).toEqual([
      { text: 'My', highlight: false },
      { text: 'Super', highlight: true },
    ])
  })

  it('merges overlapping ranges', () => {
    // [0,3] and [2,5] overlap; merged to [0,5] => slice(0,6) = 'Austra'
    expect(highlightMatches('AustralianSuper', [[0, 3], [2, 5]])).toEqual([
      { text: 'Austra', highlight: true },
      { text: 'lianSuper', highlight: false },
    ])
  })

  it('merges adjacent ranges', () => {
    // [0,2] and [3,5]: 3 <= 2+1=3, so adjacent; merged to [0,5] => slice(0,6) = 'Austra'
    expect(highlightMatches('AustralianSuper', [[0, 2], [3, 5]])).toEqual([
      { text: 'Austra', highlight: true },
      { text: 'lianSuper', highlight: false },
    ])
  })

  it('handles a full-string match', () => {
    expect(highlightMatches('Super', [[0, 4]])).toEqual([
      { text: 'Super', highlight: true },
    ])
  })

  it('produces two separate highlighted segments for non-adjacent ranges', () => {
    expect(highlightMatches('AustralianSuper', [[0, 2], [10, 12]])).toEqual([
      { text: 'Aus', highlight: true },
      { text: 'tralian', highlight: false },
      { text: 'Sup', highlight: true },
      { text: 'er', highlight: false },
    ])
  })

  it('handles unsorted index input', () => {
    expect(highlightMatches('AustralianSuper', [[10, 12], [0, 2]])).toEqual([
      { text: 'Aus', highlight: true },
      { text: 'tralian', highlight: false },
      { text: 'Sup', highlight: true },
      { text: 'er', highlight: false },
    ])
  })

  it('handles empty string input', () => {
    expect(highlightMatches('', [])).toEqual([
      { text: '', highlight: false },
    ])
  })
})

describe('createFuseInstance', () => {
  const products: MySuperProduct[] = [
    {
      product_name: 'AustralianSuper MySuper',
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
      product_name: 'Hostplus MySuper',
      current_metrics_available: true,
      pass_fail_current: 'Pass',
      nir_10yr: 0.079,
      nir_rag: 'Green',
      fees_50k: 0.006,
      fees_50k_rag: 'Amber',
      fees_100k: 0.005,
      fees_100k_rag: 'Green',
      history: { '2025': 'Pass', '2024': 'Pass' },
    },
    {
      product_name: 'REST Super MySuper',
      current_metrics_available: false,
      pass_fail_current: null,
      nir_10yr: null,
      nir_rag: null,
      fees_50k: null,
      fees_50k_rag: null,
      fees_100k: null,
      fees_100k_rag: null,
      history: { '2025': 'Pass' },
    },
    {
      product_name: 'Aware Super MySuper',
      current_metrics_available: true,
      pass_fail_current: 'Fail',
      nir_10yr: 0.055,
      nir_rag: 'Red',
      fees_50k: 0.012,
      fees_50k_rag: 'Red',
      fees_100k: 0.010,
      fees_100k_rag: 'Red',
      history: { '2025': 'Fail', '2024': 'Pass' },
    },
  ]

  it('returns exact name match as first result', () => {
    const fuse = createFuseInstance(products)
    const results = fuse.search('AustralianSuper MySuper')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].item.product_name).toBe('AustralianSuper MySuper')
  })

  it('returns results for a partial match', () => {
    const fuse = createFuseInstance(products)
    const results = fuse.search('aus')
    const names = results.map((r) => r.item.product_name)
    expect(names).toContain('AustralianSuper MySuper')
  })

  it('returns results for a fuzzy match with a typo', () => {
    const fuse = createFuseInstance(products)
    const results = fuse.search('hostpluss')
    const names = results.map((r) => r.item.product_name)
    expect(names).toContain('Hostplus MySuper')
  })

  it('returns results for a common abbreviation', () => {
    const fuse = createFuseInstance(products)
    const results = fuse.search('REST')
    const names = results.map((r) => r.item.product_name)
    expect(names).toContain('REST Super MySuper')
  })

  it('returns no results for a completely unrelated query', () => {
    const fuse = createFuseInstance(products)
    const results = fuse.search('zzzzzzz')
    expect(results).toHaveLength(0)
  })

  it('still returns products where current_metrics_available is false', () => {
    const fuse = createFuseInstance(products)
    const results = fuse.search('REST')
    const match = results.find((r) => r.item.product_name === 'REST Super MySuper')
    expect(match).toBeDefined()
    expect(match!.item.current_metrics_available).toBe(false)
  })

  it('includes match metadata for highlighting', () => {
    const fuse = createFuseInstance(products)
    const results = fuse.search('Hostplus')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].matches).toBeDefined()
    expect(results[0].matches!.length).toBeGreaterThan(0)
  })
})
