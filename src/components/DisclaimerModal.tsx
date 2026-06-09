import { useEffect, useState } from 'react'

const STORAGE_KEY = 'disclaimer_accepted_v1'

export function DisclaimerModal() {
    const [visible, setVisible] = useState(false)

  useEffect(() => {
        const accepted = sessionStorage.getItem(STORAGE_KEY)
        if (!accepted) setVisible(true)
  }, [])

  function handleAccept() {
        sessionStorage.setItem(STORAGE_KEY, 'true')
        setVisible(false)
  }

  if (!visible) return null

  return (
        <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="disclaimer-title"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
              >
              <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                      <div className="flex items-start gap-3">
                                <span className="text-2xl mt-0.5" aria-hidden="true">⚠️</span>span>
                                <h2 id="disclaimer-title" className="text-lg font-semibold text-slate-800">
                                            Important Disclaimer
                                </h2>h2>
                      </div>div>
              
                      <div className="text-sm text-slate-700 space-y-3">
                                <p>
                                            This tool is provided <strong>for informational and educational purposes only</strong>strong>.
                                            It is <strong>not financial advice</strong>strong> and must not be used as the basis for any
                                            financial, investment, or superannuation decisions.
                                </p>p>
                                <p>
                                            Performance data displayed here is sourced from APRA's publicly available reports.
                                            While we aim to reflect published data accurately,{' '}
                                            <strong>we make no guarantee of data accuracy, completeness, or currency</strong>strong>.
                                            Data may be out of date, incomplete, or contain errors.
                                </p>p>
                                <p>
                                            Always verify information directly with{' '}
                                            <a
                                                            href="https://www.apra.gov.au/annual-superannuation-performance-test"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="underline text-blue-600 hover:text-blue-800"
                                                          >
                                                          APRA's official website
                                            </a>a>{' '}
                                            and consult a licensed financial adviser before making any decisions about your
                                            superannuation.
                                </p>p>
                                <p className="text-xs text-slate-500 border-t border-slate-100 pt-3">
                                            By continuing, you acknowledge that you have read and understood this disclaimer and
                                            agree that this tool is not a substitute for professional financial advice.
                                </p>p>
                      </div>div>
              
                      <button
                                  type="button"
                                  onClick={handleAccept}
                                  className="w-full py-3 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-[44px]"
                                >
                                I understand — continue to the app
                      </button>button>
              </div>div>
        </div>div>
      )
}</div>
