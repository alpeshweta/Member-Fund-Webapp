import type { PassFail } from '../types/performance'

export type RiskLevel =
  | 'critical'      // last 2 years both Fail
  | 'warning'       // latest year Fail, previous not Fail
  | 'clear'         // latest year Pass
  | 'unknown'       // latest year is 'Unknown' or null
  | 'insufficient'  // only 1 year of history
  | 'no-data'       // history is empty

/**
 * Computes a risk level from a fund's Pass/Fail history.
 *
 * Rules:
 * - Sorts years descending so computation is order-independent
 * - 'Unknown' is NOT treated as 'Fail' — it never triggers Warning or Critical
 * - TDPs with only 1 year of history get 'insufficient', not 'clear'
 */
export function computeRiskSignal(history: Record<string, PassFail>): RiskLevel {
  const years = Object.keys(history).sort((a, b) => Number(b) - Number(a))

  if (years.length === 0) return 'no-data'
  if (years.length === 1) return 'insufficient'

  const latest = history[years[0]]
  const previous = history[years[1]]

  if (latest === 'Fail' && previous === 'Fail') return 'critical'
  if (latest === 'Fail') return 'warning'
  if (latest === 'Unknown' || latest === null) return 'unknown'
  return 'clear'
}
