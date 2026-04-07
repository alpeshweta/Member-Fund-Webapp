import type { PassFail } from '../types/performance'

interface Props {
  result: PassFail
  size?: 'sm' | 'base'
}

const CONFIG: Record<
  NonNullable<PassFail>,
  { label: string; className: string }
> = {
  Pass: {
    label: 'Pass',
    className: 'bg-green-100 text-green-800 border border-green-200',
  },
  Fail: {
    label: 'Fail',
    className: 'bg-red-100 text-red-800 border border-red-200',
  },
  Unknown: {
    label: 'Result Unknown',
    className: 'bg-slate-100 text-slate-600 border border-slate-200',
  },
}

export function StatusBadge({ result, size = 'base' }: Props) {
  if (result === null) return null

  const { label, className } = CONFIG[result]
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${textSize} ${className}`}
    >
      {label}
    </span>
  )
}
