import Fuse from 'fuse.js'
import type { FuseResult } from 'fuse.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import type { TdpProduct } from '../types/performance'
import { getUniqueProductNames, getOptionsForProduct } from '../utils/tdpHelpers'

type DrillStep = 'product' | 'option' | 'confirmed'

interface Props {
  tdp: TdpProduct[]
  loading: boolean
}

const PRODUCT_LISTBOX_ID = 'tdp-product-listbox'

/** Bold-highlight matched character ranges produced by Fuse.js. */
function highlightMatch(text: string, result: FuseResult<string>): React.ReactNode {
  const indices = result.matches?.[0]?.indices
  if (!indices || indices.length === 0) return text
  const parts: React.ReactNode[] = []
  let cursor = 0
  for (const [start, end] of indices) {
    if (start > cursor) parts.push(text.slice(cursor, start))
    parts.push(
      <mark key={start} className="bg-transparent font-semibold text-slate-900">
        {text.slice(start, end + 1)}
      </mark>,
    )
    cursor = end + 1
  }
  if (cursor < text.length) parts.push(text.slice(cursor))
  return parts
}

export function TdpDrilldown({ tdp, loading }: Props) {
  const navigate = useNavigate()

  const [step, setStep] = useState<DrillStep>('product')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FuseResult<string>[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<TdpProduct | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const productNames = useMemo(() => getUniqueProductNames(tdp), [tdp])

  const fuse = useMemo(
    () =>
      new Fuse(productNames, {
        threshold: 0.35,
        includeMatches: true,
        minMatchCharLength: 2,
      }),
    [productNames],
  )

  const options = useMemo(
    () => (selectedProduct ? getOptionsForProduct(tdp, selectedProduct) : []),
    [tdp, selectedProduct],
  )

  // Search effect
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }
    setResults(fuse.search(query, { limit: 20 }))
    setIsOpen(true)
    setActiveIndex(-1)
  }, [query, fuse])

  // Close on click-outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectProduct = useCallback(
    (name: string) => {
      setSelectedProduct(name)
      setQuery('')
      setResults([])
      setIsOpen(false)
      setActiveIndex(-1)
      const opts = getOptionsForProduct(tdp, name)
      if (opts.length === 1) {
        // Only one option — skip straight to confirmed
        setSelectedOption(opts[0])
        setStep('confirmed')
      } else {
        setStep('option')
      }
    },
    [tdp],
  )

  const selectOption = useCallback((option: TdpProduct) => {
    setSelectedOption(option)
    setStep('confirmed')
  }, [])

  const resetAll = useCallback(() => {
    setStep('product')
    setSelectedProduct(null)
    setSelectedOption(null)
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen && e.key !== 'ArrowDown') return
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          if (!isOpen && results.length > 0) setIsOpen(true)
          setActiveIndex((i) => Math.min(i + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((i) => Math.max(i - 1, -1))
          break
        case 'Enter':
          e.preventDefault()
          if (activeIndex >= 0 && results[activeIndex]) {
            selectProduct(results[activeIndex].item)
          } else if (results.length === 1 && results[0]) {
            selectProduct(results[0].item)
          }
          break
        case 'Escape':
          setIsOpen(false)
          setActiveIndex(-1)
          break
      }
    },
    [isOpen, results, activeIndex, selectProduct],
  )

  const activeItemId = activeIndex >= 0 ? `product-option-${activeIndex}` : undefined

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <p className="mt-2 text-sm text-slate-400" aria-live="polite">
        Loading fund data…
      </p>
    )
  }

  // ── Step: confirmed ──────────────────────────────────────────────────────────
  if (step === 'confirmed' && selectedOption && selectedProduct) {
    const hasMenu =
      selectedOption.investment_menu_name && selectedOption.investment_menu_name.trim() !== ''
    const compositeKey = encodeURIComponent(
      `${selectedProduct}|||${selectedOption.investment_option_name}`,
    )
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
        {/* Product name breadcrumb */}
        <p className="mb-1 text-xs text-slate-400">{selectedProduct}</p>
        {hasMenu && (
          <p className="mb-1 text-xs text-slate-400">{selectedOption.investment_menu_name}</p>
        )}

        <h2 className="text-base font-semibold text-slate-800">
          {selectedOption.investment_option_name}
        </h2>

        {!selectedOption.current_metrics_available && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Performance metrics for this option are not available in the current APRA dataset.
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={resetAll}
            className="min-h-[44px] rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Change
          </button>
          <button
            type="button"
            onClick={() =>
              navigate('/fund/tdp/' + compositeKey, { state: { fund: selectedOption } })
            }
            className="min-h-[44px] rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            View performance →
          </button>
        </div>
      </div>
    )
  }

  // ── Step: option selection ───────────────────────────────────────────────────
  if (step === 'option' && selectedProduct) {
    return (
      <div>
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1 text-sm" aria-label="Selection path">
          <button
            type="button"
            onClick={resetAll}
            className="min-h-[44px] rounded px-2 py-1 text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Search
          </button>
          <span className="text-slate-300" aria-hidden="true">›</span>
          <span className="truncate px-2 py-1 font-medium text-slate-700">{selectedProduct}</span>
          <span className="text-slate-300" aria-hidden="true">›</span>
          <span className="px-2 py-1 text-slate-400">Select option</span>
        </nav>

        <p className="mb-2 text-sm font-medium text-slate-600">
          Select an investment option ({options.length})
        </p>
        <ul
          className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white"
          role="list"
        >
          {options.map((opt, i) => (
            <li key={`${opt.investment_option_name}-${opt.investment_menu_name}-${i}`}>
              <button
                type="button"
                onClick={() => selectOption(opt)}
                className="flex min-h-[44px] w-full flex-col justify-center px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
              >
                <span className="text-sm text-slate-800">{opt.investment_option_name}</span>
                {opt.investment_menu_name && opt.investment_menu_name.trim() !== '' && (
                  <span className="mt-0.5 text-xs text-slate-400">{opt.investment_menu_name}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // ── Step: product search (default) ──────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="tdp-product-input" className="mb-1 block text-sm font-medium text-slate-700">
        Search for your Choice fund
      </label>
      <input
        id="tdp-product-input"
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={PRODUCT_LISTBOX_ID}
        aria-autocomplete="list"
        aria-activedescendant={activeItemId}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Start typing your fund name…"
        className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <ul
            id={PRODUCT_LISTBOX_ID}
            role="listbox"
            aria-label="Matching Choice funds"
            className="max-h-72 overflow-y-auto"
          >
            {results.map((result, i) => {
              const optCount = getOptionsForProduct(tdp, result.item).length
              return (
                <li
                  key={result.item}
                  id={`product-option-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectProduct(result.item)
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex cursor-pointer items-center justify-between px-4 py-3 text-sm ${
                    i === activeIndex ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                  }`}
                >
                  <span>{highlightMatch(result.item, result)}</span>
                  <span className="ml-3 shrink-0 text-xs text-slate-400">
                    {optCount} option{optCount !== 1 ? 's' : ''}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
            Showing {results.length} of {productNames.length} funds
          </p>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">
        Search across {productNames.length.toLocaleString()} funds covering{' '}
        {tdp.length.toLocaleString()} investment options. Type at least 2 characters.
      </p>
    </div>
  )
}
