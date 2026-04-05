import Fuse from 'fuse.js'
import type { MySuperProduct } from '../types/performance'

const FUSE_OPTIONS: Fuse.IFuseOptions<MySuperProduct> = {
  keys: ['product_name'],
  threshold: 0.5,
  includeMatches: true,
  // NOTE: minMatchCharLength is about match length within results, NOT query length.
  // The 2-char minimum for showing the dropdown is enforced in SearchPage UI logic.
}

export function createFuseInstance(products: MySuperProduct[]) {
  return new Fuse(products, FUSE_OPTIONS)
}

export type HighlightSegment = { text: string; highlight: boolean }

/**
 * Converts Fuse.js match indices into segments for highlighted rendering.
 * Handles overlapping and adjacent ranges by merging them before splitting.
 */
export function highlightMatches(
  text: string,
  indices: readonly [number, number][],
): HighlightSegment[] {
  if (!indices.length) return [{ text, highlight: false }]

  // Sort by start index, then merge overlapping/adjacent ranges
  const sorted = [...indices].sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1]
    if (last && start <= last[1] + 1) {
      last[1] = Math.max(last[1], end)
    } else {
      merged.push([start, end])
    }
  }

  const segments: HighlightSegment[] = []
  let lastIndex = 0
  for (const [start, end] of merged) {
    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start), highlight: false })
    }
    segments.push({ text: text.slice(start, end + 1), highlight: true })
    lastIndex = end + 1
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlight: false })
  }

  return segments
}
