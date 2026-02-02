import { useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AuthModal from './components/auth/AuthModal'
import Footer from './components/common/Footer'
import Header from './components/common/Header'
import { useAuth } from './hooks/useAuth'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import StatsAdminDashboardPage from './pages/stats/StatsAdminDashboardPage'
import StatsAdminSnapshotHistoryPage from './pages/stats/StatsAdminSnapshotHistoryPage'
import StatsOverviewPage from './pages/stats/StatsOverviewPage'
import StatsSnapshotHistoryPage from './pages/stats/StatsSnapshotHistoryPage'
import './App.css'

function App() {
    const { token, user, error } = useAuth()
    const [authModalOpen, setAuthModalOpen] = useState(false)
    const location = useLocation()
    const showAuthError = Boolean(error) && location.pathname !== '/login'
    const isAdmin = user?.role === 'ADMIN'

    return (
        <div className="app-shell">
            <Header onLoginClick={() => setAuthModalOpen(true)} />
            {showAuthError ? (
                <div className="banner banner--error app-banner">{error}</div>
            ) : null}
            <main className="app-main">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                        path="/login"
                        element={
                            token ? <Navigate to="/stats/overview" replace /> : <LoginPage />
                        }
                    />
                    <Route
                        path="/stats"
                        element={
                            token ? (
                                <Navigate to="/stats/overview" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/stats/overview"
                        element={
                            token ? <StatsOverviewPage /> : <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/stats/admin"
                        element={
                            token && isAdmin ? (
                                <StatsAdminDashboardPage />
                            ) : token ? (
                                <Navigate to="/stats/overview" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/stats/admin/snapshots"
                        element={
                            token && isAdmin ? (
                                <StatsAdminSnapshotHistoryPage />
                            ) : token ? (
                                <Navigate to="/stats/overview" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/stats/snapshots"
                        element={
                            token ? <StatsSnapshotHistoryPage /> : <Navigate to="/login" replace />
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            {authModalOpen ? (
                <AuthModal onClose={() => setAuthModalOpen(false)} />
            ) : null}
            <Footer />
        </div>
    )
}

export default App
