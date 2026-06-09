export function DisclaimerBanner() {
    return (
          <div
                  role="note"
                  aria-label="Data disclaimer"
                  className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2"
                >
                <p className="text-xs text-amber-800 text-center leading-relaxed">
                        <span className="font-semibold">⚠️ For informational purposes only.</span>span>{' '}
                        Data accuracy is not guaranteed. This is not financial advice.{' '}
                        <span className="font-medium">Always verify with{' '}
                                  <a
                                                href="https://www.apra.gov.au/annual-superannuation-performance-test"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline hover:text-amber-900"
                                              >
                                              APRA directly
                                  </a>a>{' '}
                                  and consult a licensed financial adviser.
                        </span>span>
                </p>p>
          </div>div>
        )
}</div>
