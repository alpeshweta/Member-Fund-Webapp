import type { MouseEvent } from 'react'
import Fuse from 'fuse.js'
import type { TdpProduct } from '../types/performance'
import { highlightMatches } from '../utils/search'

interface Props {
  id: string
  product: TdpProduct
  fuseResult: Fuse.FuseResult<TdpProduct>
  isActive: boolean
  onSelect: (product: TdpProduct) => void
  onMouseEnter: () => void
}

function getFieldIndices(
  fuseResult: Fuse.FuseResult<TdpProduct>,
  field: string
): readonly [number, number][] {
  return fuseResult.matches?.find(m => m.key === field)?.indices ?? []
}

export function TdpDropdownItem({ id, product, fuseResult, isActive, onSelect, onMouseEnter }: Props) {
  const optionSegments = highlightMatches(
    product.investment_option_name,
    getFieldIndices(fuseResult, 'investment_option_name')
  )
  const menuSegments = highlightMatches(
    product.investment_menu_name,
    getFieldIndices(fuseResult, 'investment_menu_name')
  )

  function handleMouseDown(e: MouseEvent) {
    e.preventDefault() // prevent input onBlur firing before onSelect
    onSelect(product)
  }

  return (
    <li
      id={id}
      role="option"
      aria-selected={isActive}
      className={`min-h-[44px] px-3 py-2 cursor-pointer flex flex-col justify-center gap-0.5 border-b border-slate-100 last:border-b-0 ${
        isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
      }`}
      onMouseDown={handleMouseDown}
      onMouseEnter={onMouseEnter}
    >
      <span className="text-sm font-medium text-slate-900">
        {optionSegments.map((seg, i) => (
          <span key={i} className={seg.highlight ? 'font-semibold' : undefined}>
            {seg.text}
          </span>
        ))}
      </span>
      <span className="text-xs text-slate-500">
        {menuSegments.map((seg, i) => (
          <span key={i} className={seg.highlight ? 'font-semibold text-slate-700' : undefined}>
            {seg.text}
          </span>
        ))}
      </span>
      <span className="text-xs text-slate-400">{product.product_name}</span>
    </li>
  )
}
