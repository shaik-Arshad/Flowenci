import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem('flowenci_token'))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) { setLoading(false); return }
        authApi.me(token)
            .then(data => setUser(data))
            .catch(() => { localStorage.removeItem('flowenci_token'); setToken(null) })
            .finally(() => setLoading(false))
    }, [token])

    const login = ({ access_token, user: userData }) => {
        localStorage.setItem('flowenci_token', access_token)
        setToken(access_token)
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('flowenci_token')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
