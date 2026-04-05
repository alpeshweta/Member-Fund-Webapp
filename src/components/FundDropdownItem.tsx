import { highlightMatches } from '../utils/search'
import type { HighlightSegment } from '../utils/search'
import type { MySuperProduct } from '../types/performance'

interface Props {
  id: string
  product: MySuperProduct
  matchIndices: readonly [number, number][]
  isActive: boolean
  onSelect: (product: MySuperProduct) => void
  onMouseEnter: () => void
}

export function FundDropdownItem({ id, product, matchIndices, isActive, onSelect, onMouseEnter }: Props) {
  const segments: HighlightSegment[] = highlightMatches(product.product_name, matchIndices)

  return (
    <li
      id={id}
      role="option"
      aria-selected={isActive}
      className={`min-h-[44px] flex items-center px-4 py-2 cursor-pointer text-slate-800 text-sm ${
        isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
      }`}
      onMouseDown={(e) => {
        // Use mousedown instead of click to fire before the input's onBlur
        e.preventDefault()
        onSelect(product)
      }}
      onMouseEnter={onMouseEnter}
    >
      {segments.map((seg, i) =>
        seg.highlight ? (
          <span key={i} className="font-semibold text-slate-900">
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </li>
  )
}
