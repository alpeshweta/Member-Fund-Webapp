import { Link, Navigate, useLocation } from 'react-router-dom'
import type { MySuperProduct } from '../types/performance'
import { usePerformanceData } from '../hooks/usePerformanceData'
import { computeRiskSignal } from '../utils/riskSignal'
import { DataFreshnessLabel } from '../components/DataFreshnessLabel'
import { StatusBadge } from '../components/StatusBadge'
import { RiskSignalBanner } from '../components/RiskSignalBanner'
import { MetricsCard } from '../components/MetricsCard'
import { HistoryTimeline } from '../components/HistoryTimeline'

export function DashboardPage() {
  const { state } = useLocation()
  const fund = (state as { fund?: MySuperProduct } | null)?.fund
  const { meta } = usePerformanceData()

  if (!fund) {
    return <Navigate to="/" replace />
  }

  // Computed values — order-independent year sorting
  const sortedYears = Object.keys(fund.history).sort((a, b) => Number(b) - Number(a))
  const latestYear = sortedYears[0] ?? '2025'
  const riskLevel = computeRiskSignal(fund.history)

  // Expected years for history depth note (from data context)
  const expectedYears = meta?.source_years_mysuper ?? []

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-10 space-y-6">

        {/* Back navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 min-h-[44px]"
        >
          <span aria-hidden="true">←</span> Search again
        </Link>

        {/* Fund heading */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{fund.product_name}</h1>
            <p className="mt-1 text-sm text-slate-500">MySuper product</p>
          </div>
          {meta && (
            <div className="shrink-0">
              <DataFreshnessLabel lastUpdated={meta.last_updated} />
            </div>
          )}
        </div>

        {/* Risk signal banner — full width, top priority */}
        <RiskSignalBanner level={riskLevel} latestYear={latestYear} />

        {/* Current APRA result card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {latestYear} APRA Performance Test
          </p>
          {fund.pass_fail_current !== null ? (
            <StatusBadge result={fund.pass_fail_current} />
          ) : (
            <p className="text-sm text-slate-400 italic">
              Result not available for this product.
            </p>
          )}
          {fund.pass_fail_current === 'Unknown' && (
            <p className="mt-2 text-xs text-slate-500">
              APRA has not published a result for this product's most recent test.
            </p>
          )}
        </div>

        {/* Metrics */}
        <MetricsCard fund={fund} />

        {/* History */}
        <HistoryTimeline history={fund.history} expectedYears={expectedYears} />

        {/* Footer note */}
        <p className="text-xs text-slate-400 pb-4">
          The APRA annual superannuation performance test assesses investment returns and fees
          against benchmarks. A fund that fails two consecutive tests must close to new members
          under Australian law.{' '}
          <a
            href="https://www.apra.gov.au/annual-superannuation-performance-test"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600"
          >
            Learn more at APRA.gov.au
          </a>
        </p>

      </div>
    </div>
  )
}
