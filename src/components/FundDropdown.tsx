import type Fuse from 'fuse.js'
import type { MySuperProduct } from '../types/performance'
import { FundDropdownItem } from './FundDropdownItem'

interface Props {
  id: string
  results: Fuse.FuseResult<MySuperProduct>[]
  activeIndex: number
  query: string
  totalProducts: number
  onSelect: (product: MySuperProduct) => void
  onActiveIndexChange: (index: number) => void
}

export function FundDropdown({
  id,
  results,
  activeIndex,
  query,
  totalProducts,
  onSelect,
  onActiveIndexChange,
}: Props) {
  const hasQuery = query.trim().length >= 2
  const hasResults = results.length > 0

  return (
    <div
      className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg"
      role="listbox"
      id={id}
      aria-label="MySuper fund results"
    >
      {hasResults ? (
        <>
          <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {results.map((result, index) => (
              <FundDropdownItem
                key={result.item.product_name}
                id={`option-${index}`}
                product={result.item}
                matchIndices={result.matches?.[0]?.indices ?? []}
                isActive={index === activeIndex}
                onSelect={onSelect}
                onMouseEnter={() => onActiveIndexChange(index)}
              />
            ))}
          </ul>
          <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400">
            Showing {results.length} of {totalProducts} MySuper products
          </div>
        </>
      ) : hasQuery ? (
        <div className="px-4 py-3 text-sm text-slate-500">
          No MySuper funds matched your search. Try a shorter or different term.
        </div>
      ) : null}
    </div>
  )
}
