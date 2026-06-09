import { HashRouter, Route, Routes } from 'react-router-dom'
import { DataProvider } from './context/PerformanceDataContext'
import { SearchPage } from './pages/SearchPage'
import { DashboardPage } from './pages/DashboardPage'
import { TdpDashboardPage } from './pages/TdpDashboardPage'
import { DisclaimerModal } from './components/DisclaimerModal'
import { DisclaimerBanner } from './components/DisclaimerBanner'

export function App() {
    return (
          <DataProvider>
                <DisclaimerModal />
                <DisclaimerBanner />
                <HashRouter>
                        <Routes>
                                  <Route path="/" element={<SearchPage />} />
                                  <Route path="/fund/:productId" element={<DashboardPage />} />
                                  <Route path="/fund/tdp/:productId" element={<TdpDashboardPage />} />
                        </Routes>
                </HashRouter>
          </DataProvider>
        )
}
