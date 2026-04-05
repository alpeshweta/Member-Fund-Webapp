import { HashRouter, Route, Routes } from 'react-router-dom'
import { DataProvider } from './context/PerformanceDataContext'
import { SearchPage } from './pages/SearchPage'
import { DashboardPage } from './pages/DashboardPage'

export function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/fund/:productId" element={<DashboardPage />} />
        </Routes>
      </HashRouter>
    </DataProvider>
  )
}
