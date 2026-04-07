import type { FundMetrics } from '../types/performance'
import type { RagColour } from '../types/performance'
import { RagIndicator } from './RagIndicator'
import { formatPercent } from '../utils/formatters'

interface MetricRowProps {
  label: string
  value: number | null
  rag: RagColour
}

function MetricRow({ label, value, rag }: MetricRowProps) {
  const isAvailable = value !== null

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium ${isAvailable ? 'text-slate-800' : 'text-slate-400'}`}>
          {formatPercent(value)}
        </span>
        {isAvailable && <RagIndicator rag={rag} />}
      </div>
    </div>
  )
}

interface Props {
  fund: FundMetrics
}

export function MetricsCard({ fund }: Props) {
  if (!fund.current_metrics_available) {
    return (
      <div
        role="note"
        className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
      >
        <span aria-hidden="true" className="mt-0.5 shrink-0">⚠</span>
        <span>
          Current year metrics are not published for this product by APRA. Pass/Fail result and
          history are shown where available.
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
        Performance Metrics
      </h2>
      <div>
        <MetricRow
          label="10-year net investment return"
          value={fund.nir_10yr}
          rag={fund.nir_rag}
        />
        <MetricRow
          label="Annual fee — $50K balance"
          value={fund.fees_50k}
          rag={fund.fees_50k_rag}
        />
        <MetricRow
          label="Annual fee — $100K balance"
          value={fund.fees_100k}
          rag={fund.fees_100k_rag}
        />
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Green = above benchmark · Red = below benchmark
      </p>
    </div>
  )
}
