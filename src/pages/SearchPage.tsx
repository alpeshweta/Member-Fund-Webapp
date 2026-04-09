import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'

import { usePerformanceData } from '../hooks/usePerformanceData'
import { createFuseInstance, createTdpFuseInstance } from '../utils/search'
import type { MySuperProduct, TdpProduct } from '../types/performance'

import { DataFreshnessLabel } from '../components/DataFreshnessLabel'
import { FundSearchInput } from '../components/FundSearchInput'
import { FundDropdown } from '../components/FundDropdown'
import { SelectedFund } from '../components/SelectedFund'
import { TdpDropdown } from '../components/TdpDropdown'
import { TdpSelectedFund } from '../components/TdpSelectedFund'

const LISTBOX_ID = 'fund-search-listbox'
const TDP_LISTBOX_ID = 'tdp-fund-search-listbox'

type Tab = 'mysuper' | 'tdp'

export function SearchPage() {
  const navigate = useNavigate()
  const { mysuper, tdp, meta, loading, error } = usePerformanceData()

  // --- Tab ---
  const [activeTab, setActiveTab] = useState<Tab>('mysuper')

  // --- MySuper search state ---
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Fuse.FuseResult<MySuperProduct>[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFund, setSelectedFund] = useState<MySuperProduct | null>(null)

  // --- TDP search state ---
  const [tdpQuery, setTdpQuery] = useState('')
  const [tdpResults, setTdpResults] = useState<Fuse.FuseResult<TdpProduct>[]>([])
  const [tdpActiveIndex, setTdpActiveIndex] = useState(-1)
  const [tdpIsOpen, setTdpIsOpen] = useState(false)
  const [tdpSelectedFund, setTdpSelectedFund] = useState<TdpProduct | null>(null)

  const inputRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tdpContainerRef = useRef<HTMLDivElement>(null)

  const fuse = useMemo(() => createFuseInstance(mysuper), [mysuper])
  const tdpFuse = useMemo(() => createTdpFuseInstance(tdp), [tdp])

  // MySuper search effect
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }
    setResults(fuse.search(query))
    setIsOpen(true)
    setActiveIndex(-1)
  }, [query, fuse])

  // TDP search effect
  useEffect(() => {
    if (tdpQuery.trim().length < 2) {
      setTdpResults([])
      setTdpIsOpen(false)
      setTdpActiveIndex(-1)
      return
    }
    setTdpResults(tdpFuse.search(tdpQuery, { limit: 15 }))
    setTdpIsOpen(true)
    setTdpActiveIndex(-1)
  }, [tdpQuery, tdpFuse])

  // Close MySuper dropdown on click-outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close TDP dropdown on click-outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tdpContainerRef.current && !tdpContainerRef.current.contains(e.target as Node)) {
        setTdpIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // --- MySuper callbacks ---
  const selectFund = useCallback((fund: MySuperProduct) => {
    setSelectedFund(fund)
    setQuery('')
    setResults([])
    setIsOpen(false)
    setActiveIndex(-1)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedFund(null)
    const input = inputRef.current?.querySelector('input')
    setTimeout(() => input?.focus(), 0)
  }, [])

  const navigateToDashboard = useCallback(() => {
    if (!selectedFund) return
    navigate('/fund/' + encodeURIComponent(selectedFund.product_name), {
      state: { fund: selectedFund },
    })
  }, [navigate, selectedFund])

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
            selectFund(results[activeIndex].item)
          } else if (results.length === 1 && results[0]) {
            selectFund(results[0].item)
          }
          break
        case 'Escape':
          setIsOpen(false)
          setActiveIndex(-1)
          break
      }
    },
    [isOpen, results, activeIndex, selectFund],
  )

  // --- TDP callbacks ---
  const selectTdpFund = useCallback((fund: TdpProduct) => {
    setTdpSelectedFund(fund)
    setTdpQuery('')
    setTdpResults([])
    setTdpIsOpen(false)
    setTdpActiveIndex(-1)
  }, [])

  const clearTdpSelection = useCallback(() => {
    setTdpSelectedFund(null)
    const input = tdpContainerRef.current?.querySelector('input')
    setTimeout(() => input?.focus(), 0)
  }, [])

  const navigateToTdpDashboard = useCallback(() => {
    if (!tdpSelectedFund) return
    navigate('/fund/tdp/' + encodeURIComponent(tdpSelectedFund.investment_option_name), {
      state: { fund: tdpSelectedFund },
    })
  }, [navigate, tdpSelectedFund])

  const handleTdpKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!tdpIsOpen && e.key !== 'ArrowDown') return
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          if (!tdpIsOpen && tdpResults.length > 0) setTdpIsOpen(true)
          setTdpActiveIndex((i) => Math.min(i + 1, tdpResults.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setTdpActiveIndex((i) => Math.max(i - 1, -1))
          break
        case 'Enter':
          e.preventDefault()
          if (tdpActiveIndex >= 0 && tdpResults[tdpActiveIndex]) {
            selectTdpFund(tdpResults[tdpActiveIndex].item)
          } else if (tdpResults.length === 1 && tdpResults[0]) {
            selectTdpFund(tdpResults[0].item)
          }
          break
        case 'Escape':
          setTdpIsOpen(false)
          setTdpActiveIndex(-1)
          break
      }
    },
    [tdpIsOpen, tdpResults, tdpActiveIndex, selectTdpFund],
  )

  const activeItemId = activeIndex >= 0 ? `option-${activeIndex}` : null
  const tdpActiveItemId = tdpActiveIndex >= 0 ? `tdp-option-${tdpActiveIndex}` : null

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            APRA Superannuation Performance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Check your fund's annual APRA test status, history, and risk level.
          </p>
          {meta && (
            <div className="mt-2">
              <DataFreshnessLabel lastUpdated={meta.last_updated} />
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-medium">Unable to load fund data.</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 min-h-[44px] inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex border-b border-slate-200 mb-4" role="tablist" aria-label="Fund type">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mysuper'}
            aria-controls="panel-mysuper"
            id="tab-mysuper"
            onClick={() => setActiveTab('mysuper')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'mysuper'
                ? 'border-slate-800 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            MySuper
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'tdp'}
            aria-controls="panel-tdp"
            id="tab-tdp"
            onClick={() => setActiveTab('tdp')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'tdp'
                ? 'border-slate-800 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Choice (TDP)
          </button>
        </div>

        {/* MySuper panel */}
        <div
          id="panel-mysuper"
          role="tabpanel"
          aria-labelledby="tab-mysuper"
          hidden={activeTab !== 'mysuper'}
        >
          {!selectedFund ? (
            <div ref={containerRef} className="relative">
              <div ref={inputRef}>
                <FundSearchInput
                  query={query}
                  isOpen={isOpen}
                  listboxId={LISTBOX_ID}
                  activeItemId={activeItemId}
                  disabled={loading || !!error}
                  onChange={setQuery}
                  onKeyDown={handleKeyDown}
                />
              </div>
              {loading && (
                <p className="mt-2 text-sm text-slate-400" aria-live="polite">
                  Loading fund data…
                </p>
              )}
              {isOpen && (
                <FundDropdown
                  id={LISTBOX_ID}
                  results={results}
                  activeIndex={activeIndex}
                  query={query}
                  totalProducts={meta?.total_mysuper_products ?? 127}
                  onSelect={selectFund}
                  onActiveIndexChange={setActiveIndex}
                />
              )}
            </div>
          ) : (
            <SelectedFund
              fund={selectedFund}
              onClear={clearSelection}
              onNavigate={navigateToDashboard}
            />
          )}
          {!loading && !error && !selectedFund && (
            <p className="mt-3 text-xs text-slate-400">
              Search across {meta?.total_mysuper_products ?? 127} MySuper products. Type at least 2
              characters.
            </p>
          )}
        </div>

        {/* TDP panel */}
        <div
          id="panel-tdp"
          role="tabpanel"
          aria-labelledby="tab-tdp"
          hidden={activeTab !== 'tdp'}
        >
          {!tdpSelectedFund ? (
            <div ref={tdpContainerRef} className="relative">
              <FundSearchInput
                query={tdpQuery}
                isOpen={tdpIsOpen}
                listboxId={TDP_LISTBOX_ID}
                activeItemId={tdpActiveItemId}
                disabled={loading || !!error}
                onChange={setTdpQuery}
                onKeyDown={handleTdpKeyDown}
                label="Search for your TDP investment option"
                placeholder="Start typing your investment option or fund name…"
              />
              {loading && (
                <p className="mt-2 text-sm text-slate-400" aria-live="polite">
                  Loading fund data…
                </p>
              )}
              {tdpIsOpen && (
                <TdpDropdown
                  id={TDP_LISTBOX_ID}
                  results={tdpResults}
                  activeIndex={tdpActiveIndex}
                  query={tdpQuery}
                  totalProducts={tdp.length}
                  onSelect={selectTdpFund}
                  onActiveIndexChange={setTdpActiveIndex}
                />
              )}
            </div>
          ) : (
            <TdpSelectedFund
              fund={tdpSelectedFund}
              onClear={clearTdpSelection}
              onNavigate={navigateToTdpDashboard}
            />
          )}
          {!loading && !error && !tdpSelectedFund && (
            <p className="mt-3 text-xs text-slate-400">
              Search across {tdp.length.toLocaleString()} TDP investment options. Type at least 2
              characters.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
