const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface Props {
  lastUpdated: string // e.g. "2025-06"
}

export function DataFreshnessLabel({ lastUpdated }: Props) {
  const [year, monthStr] = lastUpdated.split('-')
  const monthIndex = parseInt(monthStr ?? '0', 10) - 1
  const monthName = MONTHS[monthIndex] ?? monthStr

  return (
    <p className="text-sm text-slate-500">
      Data last updated:{' '}
      <span className="font-medium text-slate-600">
        {monthName} {year}
      </span>
    </p>
  )
}
