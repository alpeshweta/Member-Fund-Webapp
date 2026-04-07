import { describe, it, expect } from 'vitest'
import { highlightMatches } from '../utils/search'

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
