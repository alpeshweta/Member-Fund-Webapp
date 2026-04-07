import type { PassFail } from '../types/performance'
import { StatusBadge } from './StatusBadge'

interface Props {
  history: Record<string, PassFail>
  expectedYears: string[]  // from meta.source_years_mysuper or source_years_tdp
}

export function HistoryTimeline({ history, expectedYears }: Props) {
  const years = Object.keys(history).sort((a, b) => Number(b) - Number(a))

  if (years.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Pass/Fail History
        </h2>
        <p className="text-sm text-slate-400">No history available for this product.</p>
      </div>
    )
  }

  const earliestYear = years[years.length - 1]
  const hasLimitedHistory = years.length < expectedYears.length

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Pass/Fail History
      </h2>

      <ul className="divide-y divide-slate-100" aria-label="Annual APRA test results">
        {years.map((year, index) => {
          const result = history[year]
          const isLatest = index === 0

          return (
            <li
              key={year}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 w-10">{year}</span>
                {isLatest && (
                  <span className="text-xs text-slate-400 font-normal">Latest</span>
                )}
              </div>
              <StatusBadge result={result} size="sm" />
            </li>
          )
        })}
      </ul>

      {hasLimitedHistory && (
        <p className="mt-3 text-xs text-slate-400">
          History available from {earliestYear} only.
        </p>
      )}
    </div>
  )
}
