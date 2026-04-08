import type { TdpProduct } from '../types/performance'

interface Props {
  fund: TdpProduct
  onClear: () => void
  onNavigate: () => void
}

export function TdpSelectedFund({ fund, onClear, onNavigate }: Props) {
  return (
    <div className="mt-4 bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Selected</p>
          <p className="mt-0.5 text-base font-semibold text-slate-800 leading-snug">
            {fund.investment_option_name}
          </p>
          <p className="text-xs text-slate-600">{fund.investment_menu_name}</p>
          <p className="text-xs text-slate-400">{fund.product_name}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-sm text-slate-500 underline hover:text-slate-700 shrink-0"
          aria-label="Change selected fund"
        >
          Change
        </button>
      </div>

      {!fund.current_metrics_available && (
        <div
          role="note"
          className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700"
        >
          <span aria-hidden="true">⚠</span>
          <span>
            Current year metrics are not available for this product. Pass/Fail status and history are
            still shown.
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onNavigate}
        className="min-h-[44px] w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
      >
        View performance
        <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}
