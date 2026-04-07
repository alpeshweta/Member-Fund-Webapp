/**
 * Formats a decimal metric value as a percentage string.
 * e.g. 0.0675 → "6.75% p.a."
 * null → "Not available"
 */
export function formatPercent(value: number | null): string {
  if (value === null) return 'Not available'
  return (value * 100).toFixed(2) + '% p.a.'
}
