import { createContext, useContext, useEffect, useState } from 'react'
import type { MySuperProduct, TdpProduct, PerformanceMeta, PerformanceData } from '../types/performance'

interface PerformanceDataContextValue {
  mysuper: MySuperProduct[]
  tdp: TdpProduct[]
  meta: PerformanceMeta | null
  loading: boolean
  error: string | null
}

const PerformanceDataContext = createContext<PerformanceDataContextValue>({
  mysuper: [],
  tdp: [],
  meta: null,
  loading: true,
  error: null,
})

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [mysuper, setMysuper] = useState<MySuperProduct[]>([])
  const [tdp, setTdp] = useState<TdpProduct[]>([])
  const [meta, setMeta] = useState<PerformanceMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}performance-data.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<PerformanceData>
      })
      .then((data) => {
        if (!Array.isArray(data.mysuper_products) || data.mysuper_products.length === 0) {
          throw new Error('Fund data is currently unavailable.')
        }
        setMysuper(data.mysuper_products)
        setTdp(Array.isArray(data.tdp_products) ? data.tdp_products : [])
        setMeta({
          last_updated: data.last_updated,
          source_years_mysuper: data.source_years_mysuper,
          source_years_tdp: data.source_years_tdp,
          total_mysuper_products: data.total_mysuper_products,
          total_tdp_options: data.total_tdp_options,
        })
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <PerformanceDataContext.Provider value={{ mysuper, tdp, meta, loading, error }}>
      {children}
    </PerformanceDataContext.Provider>
  )
}

export function usePerformanceDataContext() {
  return useContext(PerformanceDataContext)
      }
