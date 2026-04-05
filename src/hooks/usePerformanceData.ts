import { usePerformanceDataContext } from '../context/PerformanceDataContext'

export function usePerformanceData() {
  return usePerformanceDataContext()
}
