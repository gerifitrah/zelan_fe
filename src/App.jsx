import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'

// Protected Route Component
function ProtectedRoute({ children }) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    const authToken = localStorage.getItem('authToken')

    if (!isAuthenticated || !authToken) {
        return <Navigate to="/login" replace />
    }

    return children
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute>
                        <AdminPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}

export default App

