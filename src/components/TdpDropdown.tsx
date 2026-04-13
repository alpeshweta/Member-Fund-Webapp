import type { FuseResult } from 'fuse.js'
import type { TdpProduct } from '../types/performance'
import { TdpDropdownItem } from './TdpDropdownItem'

interface Props {
  id: string
  results: FuseResult<TdpProduct>[]
  activeIndex: number
  query: string
  totalProducts: number
  onSelect: (product: TdpProduct) => void
  onActiveIndexChange: (index: number) => void
}

export function TdpDropdown({
  id,
  results,
  activeIndex,
  query,
  totalProducts,
  onSelect,
  onActiveIndexChange,
}: Props) {
  if (query.trim().length < 2) return null

  return (
    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg">
      <ul
        id={id}
        role="listbox"
        aria-label="Matching TDP investment options"
        className="max-h-72 overflow-y-auto"
      >
        {results.length === 0 ? (
          <li className="px-3 py-3 text-sm text-slate-500">
            No TDP options matched your search. Try a shorter or different term.
          </li>
        ) : (
          results.map((result, index) => (
            <TdpDropdownItem
              key={`${result.item.investment_option_name}-${result.item.investment_menu_name}-${index}`}
              id={`tdp-option-${index}`}
              product={result.item}
              fuseResult={result}
              isActive={index === activeIndex}
              onSelect={onSelect}
              onMouseEnter={() => onActiveIndexChange(index)}
            />
          ))
        )}
      </ul>
      {results.length > 0 && (
        <p className="text-xs text-slate-400 px-3 py-1.5 border-t border-slate-100 bg-slate-50 rounded-b-md">
          Showing {results.length} of {totalProducts} TDP options
        </p>
      )}
    </div>
  )
}
