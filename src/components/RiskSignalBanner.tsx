import type { RiskLevel } from '../utils/riskSignal'

interface Props {
  level: RiskLevel
  latestYear: string
}

interface BannerConfig {
  containerClass: string
  icon: string
  heading: string
  body: string
  showApraLink?: boolean
}

function getBannerConfig(level: RiskLevel, latestYear: string): BannerConfig {
  switch (level) {
    case 'critical':
      return {
        containerClass: 'bg-red-50 border-red-200 text-red-800',
        icon: '⚠',
        heading: 'Critical',
        body: 'This fund has failed 2 consecutive APRA performance tests. Under APRA rules, it must close to new members. Consider switching to a different fund.',
        showApraLink: true,
      }
    case 'warning':
      return {
        containerClass: 'bg-amber-50 border-amber-200 text-amber-800',
        icon: '⚠',
        heading: 'At Risk',
        body: `This fund failed the ${latestYear} APRA performance test. A second consecutive fail would trigger mandatory closure under APRA rules. Monitor closely.`,
      }
    case 'clear':
      return {
        containerClass: 'bg-green-50 border-green-200 text-green-800',
        icon: '✓',
        heading: 'Clear',
        body: 'This fund passed the most recent APRA performance test.',
      }
    case 'unknown':
      return {
        containerClass: 'bg-slate-50 border-slate-200 text-slate-600',
        icon: '—',
        heading: 'Result Unknown',
        body: 'APRA has not published a result for this product\'s most recent performance test.',
      }
    case 'insufficient':
      return {
        containerClass: 'bg-slate-50 border-slate-200 text-slate-600',
        icon: '—',
        heading: 'Insufficient History',
        body: 'Only one year of data is available. The consecutive-fail risk signal requires at least 2 years to assess.',
      }
    case 'no-data':
      return {
        containerClass: 'bg-slate-50 border-slate-200 text-slate-600',
        icon: '—',
        heading: 'No History Available',
        body: 'Risk cannot be assessed — no historical test data exists for this product.',
      }
  }
}

export function RiskSignalBanner({ level, latestYear }: Props) {
  const config = getBannerConfig(level, latestYear)

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-lg border p-4 ${config.containerClass}`}
    >
      <div className="flex gap-3">
        <span className="text-lg leading-none shrink-0 mt-0.5" aria-hidden="true">
          {config.icon}
        </span>
        <div className="space-y-1">
          <p className="font-semibold text-sm">{config.heading}</p>
          <p className="text-sm">{config.body}</p>
          {config.showApraLink && (
            <a
              href="https://www.apra.gov.au/annual-superannuation-performance-test"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-1 text-sm font-medium underline hover:opacity-80 min-h-[44px]"
            >
              View APRA performance test information →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
