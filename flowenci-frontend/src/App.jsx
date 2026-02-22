import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import Practice from './pages/Practice'
import Feedback from './pages/Feedback'
import Roleplay from './pages/Roleplay'

function Spinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0e0c0a]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-[#7a6e63] text-sm">Loading Flowenci…</p>
            </div>
        </div>
    )
}

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <Spinner />
    if (!user) return <Navigate to="/login" replace />
    return <Layout>{children}</Layout>
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <Spinner />
    if (user) return <Navigate to="/dashboard" replace />
    return children
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
            <Route path="/feedback/:recordingId" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
            <Route path="/roleplay" element={<ProtectedRoute><Roleplay /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}
