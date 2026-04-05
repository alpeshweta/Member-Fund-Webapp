import { Link, Navigate, useLocation } from 'react-router-dom'
import type { MySuperProduct } from '../types/performance'

export function DashboardPage() {
  const { state } = useLocation()
  const fund = (state as { fund?: MySuperProduct } | null)?.fund

  if (!fund) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
        >
          <span aria-hidden="true">←</span> Search again
        </Link>

        <h1 className="text-2xl font-semibold text-slate-800">{fund.product_name}</h1>
        <p className="mt-1 text-sm text-slate-500">MySuper product</p>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm text-center">
          <p className="text-slate-500 text-sm">
            Performance dashboard coming soon.
          </p>
          <p className="mt-1 text-slate-400 text-xs">
            Pass/Fail status, history, and risk signal will appear here (Epic 2).
          </p>
        </div>
      </div>
    </div>
  )
}
